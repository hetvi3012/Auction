const express = require('express');
const { protect } = require('../utils/authMiddleware');
const { Bid, Auction, User, sequelize, ProxyBidLimit } = require('../models');
const AuctionContext = require('../services/AuctionContext');
const { AuctionSubject } = require('../services/ObserverRegistry');
const ProxyBiddingEngine = require('../services/ProxyBiddingEngine');

const router = express.Router();

// Place a new manual bid
router.post('/', protect, async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { auctionId, amount } = req.body;

        // Lock the auction row so no other bids can process simultaneously
        const auction = await Auction.findByPk(auctionId, { transaction, lock: transaction.LOCK.UPDATE });
        if (!auction || auction.status !== 'Active') {
            throw new Error('Auction not found or not active');
        }

        if (new Date() > new Date(auction.endTime)) {
            throw new Error('Auction has ended');
        }

        const user = await User.findByPk(req.user.id, { transaction });

        // Enforce rules using Strategy Pattern
        AuctionContext.setStrategy(auction.strategyType);
        AuctionContext.validateBid(auction.currentHighestBid, amount, user.walletBalance);

        // Update Auction and Current Highest Bid
        if (auction.strategyType === 'English' && amount > auction.currentHighestBid) {
            auction.currentHighestBid = amount;
            auction.winningBidderId = user.id;
            await auction.save({ transaction });
        } else if (auction.strategyType === 'Vickrey') {
            if (amount > auction.currentHighestBid) {
                 auction.currentHighestBid = amount;
                 await auction.save({ transaction });
            }
        }

        const bid = await Bid.create({
            auctionId,
            bidderId: user.id,
            amount,
            isProxyBid: false
        }, { transaction });

        // IMPORTANT: Let the Proxy Engine evaluate if someone else's auto-bid 
        // needs to counter this manual bid right away, BEFORE committing.
        if (auction.strategyType === 'English') {
            await ProxyBiddingEngine.processProxyBids(auction, amount, user.id, transaction);
        }

        await transaction.commit();

        // Trigger Observers for the manual bid
        const bidData = {
            auctionId,
            bidderId: user.id,
            amount,
            timestamp: new Date()
        };
        AuctionSubject.notifyNewBid(bidData);

        res.status(201).json({ message: "Bid processed." });
    } catch (error) {
        await transaction.rollback();
        res.status(400).json({ message: error.message });
    }
});

// Configure a proxy bid limit
router.post('/proxy', protect, async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { auctionId, maxWillingToPay } = req.body;
        
        // Ensure user has the wallet balance for their max promise
        const user = await User.findByPk(req.user.id, { transaction });
        if (user.walletBalance < maxWillingToPay) {
            throw new Error("Insufficient wallet balance for this proxy limit.");
        }

        // Upsert proxy limit
        const [proxyLimit, created] = await ProxyBidLimit.findOrCreate({
            where: { auctionId, bidderId: user.id },
            defaults: { maxWillingToPay },
            transaction
        });

        if (!created) {
            proxyLimit.maxWillingToPay = maxWillingToPay;
            await proxyLimit.save({ transaction });
        }

        await transaction.commit();
        res.status(200).json({ message: "Proxy limit set successfully." });

    } catch (error) {
         await transaction.rollback();
         res.status(400).json({ message: error.message });
    }
});

module.exports = router;
