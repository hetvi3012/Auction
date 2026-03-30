const AuctionRepository = require('../repositories/AuctionRepository');
const UserRepository = require('../repositories/UserRepository');
const TicketRepository = require('../repositories/TicketRepository');
const BidRepository = require('../repositories/BidRepository');
const PlaceBidCommand = require('../commands/PlaceBidCommand');
const SettleAuctionCommand = require('../commands/SettleAuctionCommand');
const CreateAuctionCommand = require('../commands/CreateAuctionCommand');
const CommandInvoker = require('../commands/CommandInvoker');
const { buildBidValidationChain } = require('../middleware/BidValidationChain');
const LoggingDecorator = require('../decorators/LoggingDecorator');
const ValidationDecorator = require('../decorators/ValidationDecorator');
const { Auction, User, sequelize, ProxyBidLimit } = require('../models');

/**
 * Facade Pattern — AuctionFacade
 * Provides a simplified, unified interface to the complex subsystem
 * of auctions, bids, strategies, and settlement.
 * 
 * This is the SINGLE ENTRY POINT used by all controllers.
 */
class AuctionFacade {
    constructor() {
        // Wrap repositories with logging decorators for observability
        this.auctionRepo = LoggingDecorator.wrap(AuctionRepository, 'AuctionRepository');
        this.userRepo = LoggingDecorator.wrap(UserRepository, 'UserRepository');
        this.ticketRepo = LoggingDecorator.wrap(TicketRepository, 'TicketRepository');
        this.bidRepo = LoggingDecorator.wrap(BidRepository, 'BidRepository');
    }

    // ─── Auction Operations ──────────────────────────────────────

    /**
     * Create a new auction.
     * Orchestrates: Builder → Factory → Repository
     * @param {object} params - { ticketId, strategyType, startingPrice, endTime }
     * @param {string} sellerId
     * @returns {Promise<object>}
     */
    async createAuction(params, sellerId) {
        const command = new CreateAuctionCommand(params, sellerId);
        return CommandInvoker.executeCommand(command);
    }

    /**
     * Get all active auctions.
     * @returns {Promise<object[]>}
     */
    async getActiveAuctions() {
        return this.auctionRepo.findActiveAuctions();
    }

    /**
     * Settle (close) an auction.
     * @param {string} auctionId
     * @returns {Promise<object>}
     */
    async settleAuction(auctionId) {
        const command = new SettleAuctionCommand(auctionId);
        return CommandInvoker.executeCommand(command);
    }

    // ─── Bid Operations ──────────────────────────────────────────

    /**
     * Place a bid on an auction.
     * Orchestrates: Validation Chain → Decorator → Command → Observer
     * @param {string} auctionId 
     * @param {number} amount 
     * @param {string} userId 
     * @returns {Promise<object>}
     */
    async placeBid(auctionId, amount, userId) {
        // 1. Pre-validation with Decorator
        await ValidationDecorator.validateBidPreconditions(auctionId, amount, userId);

        // 2. Chain of Responsibility validation
        const auction = await Auction.findByPk(auctionId);
        const user = await User.findByPk(userId);
        const validationChain = buildBidValidationChain();
        await validationChain.handle({ auction, user, amount });

        // 3. Execute via Command Pattern
        const command = new PlaceBidCommand(auctionId, amount, userId);
        return CommandInvoker.executeCommand(command);
    }

    /**
     * Set a proxy bid limit for a user on an auction.
     * @param {string} auctionId 
     * @param {string} userId 
     * @param {number} maxWillingToPay 
     * @returns {Promise<object>}
     */
    async setProxyBidLimit(auctionId, userId, maxWillingToPay) {
        const transaction = await sequelize.transaction();
        try {
            const user = await User.findByPk(userId, { transaction });
            if (user.walletBalance < maxWillingToPay) {
                throw new Error('Insufficient wallet balance for this proxy limit.');
            }

            const [proxyLimit, created] = await ProxyBidLimit.findOrCreate({
                where: { auctionId, bidderId: userId },
                defaults: { maxWillingToPay },
                transaction
            });

            if (!created) {
                proxyLimit.maxWillingToPay = maxWillingToPay;
                await proxyLimit.save({ transaction });
            }

            await transaction.commit();
            return { message: 'Proxy limit set successfully.' };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    // ─── Analytics ───────────────────────────────────────────────

    /**
     * Get platform analytics data.
     * @returns {Promise<object>}
     */
    async getAnalytics() {
        const [totalVolume, totalUsers, activeAuctions, closedAuctions] = await Promise.all([
            this.auctionRepo.getTotalVolume(),
            this.userRepo.getTotalUsers(),
            this.auctionRepo.countActive(),
            this.auctionRepo.countClosed()
        ]);

        return {
            status: 'HEALTHY',
            metrics: {
                totalVolume,
                totalUsers,
                auctions: {
                    active: activeAuctions,
                    completed: closedAuctions
                }
            }
        };
    }

    // ─── Ticket Operations ───────────────────────────────────────

    /**
     * Create a new ticket.
     * @param {object} ticketData - { eventId, seatInfo }
     * @param {string} sellerId 
     * @returns {Promise<object>}
     */
    async createTicket(ticketData, sellerId) {
        return this.ticketRepo.create({
            sellerId,
            eventId: ticketData.eventId,
            seatInfo: ticketData.seatInfo
        });
    }

    /**
     * Get all available tickets.
     * @returns {Promise<object[]>}
     */
    async getAvailableTickets() {
        return this.ticketRepo.findAvailableTickets();
    }
}

module.exports = new AuctionFacade();
