const { ProxyBidLimit, Bid, User } = require('../models');
const { Op } = require('sequelize');
const { AuctionSubject } = require('./ObserverRegistry');

class ProxyBiddingEngine {
    
    /**
     * Scans for competing proxy bids and automatically escalates the current price 
     * up to the challengers' maximum limits. This MUST execute inside the same 
     * database transaction as the manual bid that triggered it to prevent race conditions.
     */
    async processProxyBids(auction, newManualBidAmount, manualBidderId, transaction) {
        
        // 1. Find all proxy limits for this auction, excluding the manual bidder
        const competingProxies = await ProxyBidLimit.findAll({
            where: { 
                auctionId: auction.id,
                bidderId: { [Op.ne]: manualBidderId } // Exclude the person who just bid Manually
            },
            order: [['maxWillingToPay', 'DESC']], // Highest proxy limit first
            lock: transaction.LOCK.UPDATE,        // Prevent other processes from resolving the proxy clash
            transaction
        });

        if (competingProxies.length === 0) return; // No auto-bids to process

        const topProxy = competingProxies[0];
        const bidIncrement = 1; // Standard minimum increment ($1)

        // Scenario A: Top proxy limit beats the manual bid.
        // The Proxy Agent outbids the manual bidder immediately.
        if (topProxy.maxWillingToPay > newManualBidAmount) {
            
            // Auto-bid amount is the manual bid + $1, OR the max proxy limit, whichever is lower.
            let autoBidAmount = newManualBidAmount + bidIncrement;
            if (autoBidAmount > topProxy.maxWillingToPay) {
                autoBidAmount = topProxy.maxWillingToPay;
            }

            // Ensure the proxy user actually has the wallet balance for their auto-bid
            const proxyUser = await User.findByPk(topProxy.bidderId, { transaction });
            if (proxyUser.walletBalance < autoBidAmount) {
                 return; // Proxy user is broke, their limit is ignored.
            }

            // 1. Update Auction
            auction.currentHighestBid = autoBidAmount;
            auction.winningBidderId = topProxy.bidderId;
            await auction.save({ transaction });

            // 2. Create the physical auto-bid record
            const newBid = await Bid.create({
                auctionId: auction.id,
                bidderId: topProxy.bidderId,
                amount: autoBidAmount
            }, { transaction });

            // 3. Notify clients
            AuctionSubject.notifyNewBid({
                auctionId: auction.id,
                bidderId: topProxy.bidderId,
                amount: autoBidAmount,
                timestamp: new Date(),
                isProxyAutoBid: true
            });
        } 
        
        // Scenario B: Manual bid beats the highest proxy limit.
        // The Proxy agent maxes out and fails to defend the lead.
        else if (newManualBidAmount > topProxy.maxWillingToPay) {
            // We can optionally create a final bid for the proxy agent exactly AT their maximum limit 
            // to show they tried to fight back, but the manual bidder still won.
            
            const proxyUser = await User.findByPk(topProxy.bidderId, { transaction });
            if (proxyUser.walletBalance >= topProxy.maxWillingToPay && auction.currentHighestBid < topProxy.maxWillingToPay) {
                
                // The proxy user auto-bids their absolute max
                await Bid.create({
                    auctionId: auction.id,
                    bidderId: topProxy.bidderId,
                    amount: topProxy.maxWillingToPay
                }, { transaction });
                
                // BUT the manual bidder STILL wins because their manual bid was higher.
                // The main endpoint logic already stored their manual bid. We just bumped the visible 'bid history'.
            }
        }
    }
}

module.exports = new ProxyBiddingEngine();
