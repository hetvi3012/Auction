const { sequelize, Bid, User, Auction } = require('../models');
const AuctionContext = require('../services/AuctionContext');
const { AuctionSubject } = require('../services/ObserverRegistry');
const ProxyBiddingEngine = require('../services/ProxyBiddingEngine');

/**
 * Command Pattern — PlaceBidCommand
 * Encapsulates the entire bid-placement operation as a command object.
 * Can be dispatched through the CommandInvoker.
 */
class PlaceBidCommand {
    /**
     * @param {string} auctionId 
     * @param {number} amount 
     * @param {string} userId 
     */
    constructor(auctionId, amount, userId) {
        this.auctionId = auctionId;
        this.amount = amount;
        this.userId = userId;
        this.bidRecord = null; // Populated after execution
    }

    /**
     * Execute the bid placement within a database transaction.
     * @returns {Promise<object>} Result of the operation
     */
    async execute() {
        const transaction = await sequelize.transaction();

        try {
            // 1. Lock the auction row
            const auction = await Auction.findByPk(this.auctionId, {
                transaction,
                lock: transaction.LOCK.UPDATE
            });
            if (!auction || auction.status !== 'Active') {
                throw new Error('Auction not found or not active.');
            }
            if (new Date() > new Date(auction.endTime)) {
                throw new Error('Auction has ended.');
            }

            // 2. Fetch user
            const user = await User.findByPk(this.userId, { transaction });

            // 3. Validate bid using Strategy Pattern
            AuctionContext.setStrategy(auction.strategyType);
            AuctionContext.validateBid(auction.currentHighestBid, this.amount, user.walletBalance);

            // 4. Update auction state
            if (auction.strategyType === 'English' && this.amount > auction.currentHighestBid) {
                auction.currentHighestBid = this.amount;
                auction.winningBidderId = user.id;
                await auction.save({ transaction });
            } else if (auction.strategyType === 'Vickrey') {
                if (this.amount > auction.currentHighestBid) {
                    auction.currentHighestBid = this.amount;
                    await auction.save({ transaction });
                }
            }

            // 5. Create bid record
            this.bidRecord = await Bid.create({
                auctionId: this.auctionId,
                bidderId: user.id,
                amount: this.amount,
                isProxyBid: false
            }, { transaction });

            // 6. Process proxy bids for English auctions
            if (auction.strategyType === 'English') {
                await ProxyBiddingEngine.processProxyBids(auction, this.amount, user.id, transaction);
            }

            await transaction.commit();

            // 7. Notify observers (outside transaction)
            AuctionSubject.notifyNewBid({
                auctionId: this.auctionId,
                bidderId: user.id,
                amount: this.amount,
                timestamp: new Date()
            });

            return { success: true, message: 'Bid processed.' };

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Undo stub — for future rollback support.
     */
    async undo() {
        console.log(`[PlaceBidCommand] Undo not yet implemented for bid ${this.bidRecord?.id}`);
    }
}

module.exports = PlaceBidCommand;
