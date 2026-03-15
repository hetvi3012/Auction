const { sequelize, Auction, Ticket, User, Bid } = require('../models');
const AuctionContext = require('./AuctionContext');
const { AuctionSubject } = require('./ObserverRegistry');
const { emailQueue, pdfQueue } = require('./JobQueueService');

class AuctionSettlementService {
    async settleAuction(auctionId) {
        const transaction = await sequelize.transaction();

        try {
            // 1. Fetch Auction with lock
            const auction = await Auction.findByPk(auctionId, { transaction, lock: transaction.LOCK.UPDATE });
            if (!auction) throw new Error('Auction not found');
            if (auction.status === 'Closed') throw new Error('Auction already closed');

            // 2. Fetch Ticket
            const ticket = await Ticket.findByPk(auction.ticketId, { transaction });
            if (!ticket) throw new Error('Ticket not found');

            // 3. Fetch Top Bids
            const bids = await Bid.findAll({
                where: { auctionId: auction.id },
                order: [['amount', 'DESC']],
                transaction
            });

            // 4. Determine Winner using Strategy Pattern
            AuctionContext.setStrategy(auction.strategyType);
            const settlementDetails = AuctionContext.determineWinnerAndPrice(bids);

            if (settlementDetails) {
                const { winnerId, finalPrice } = settlementDetails;

                // 5a. Deduct funds from Buyer
                const buyer = await User.findByPk(winnerId, { transaction });
                if (buyer.walletBalance < finalPrice) {
                    throw new Error('Buyer has insufficient funds for settlement');
                }
                buyer.walletBalance -= finalPrice;
                await buyer.save({ transaction });

                // 5b. Add funds to Seller
                const seller = await User.findByPk(ticket.sellerId, { transaction });
                seller.walletBalance += finalPrice;
                await seller.save({ transaction });

                // 5c. Transfer Ticket Ownership
                ticket.status = 'Sold';
                ticket.sellerId = buyer.id; // Buyer is now the owner
                await ticket.save({ transaction });

                // 5d. Update Auction Document
                auction.status = 'Closed';
                auction.winningBidderId = buyer.id;
                auction.currentHighestBid = finalPrice; // Reflect the final clearing price
                await auction.save({ transaction });

                await transaction.commit();

                // 6. Asynchronous Non-Blocking Tasks via Redis/BullMQ
                await emailQueue.add('SendWinnerEmail', {
                    to: buyer.email,
                    subject: 'You won the auction!',
                    body: `Congratulations ${buyer.name}, you won the ticket for an amount of $${finalPrice}.`
                });

                await pdfQueue.add('GenerateReceipt', {
                    transactionId: auction.id,
                    amount: finalPrice
                });

                // Notify Observers (WebSockets)
                AuctionSubject.notifyAuctionClosed({
                    auctionId: auction.id,
                    winningBidderId: buyer.id,
                    finalPrice: finalPrice
                });

                return { success: true, message: 'Auction settled and background jobs dispatched.' };

            } else {
                // No bids placed. Return ticket to seller.
                auction.status = 'Closed';
                await auction.save({ transaction });
                
                ticket.status = 'Available';
                await ticket.save({ transaction });

                await transaction.commit();

                AuctionSubject.notifyAuctionClosed({
                    auctionId: auction.id,
                    winningBidderId: null,
                    finalPrice: 0,
                    message: "No bids placed."
                });

                return { success: true, message: 'Auction closed with no winners.' };
            }

        } catch (error) {
            await transaction.rollback();
            console.error('[SettlementService] Transaction aborted:', error.message);
            throw error;
        }
    }
}

module.exports = new AuctionSettlementService();
