const { Auction } = require('../models');
const { Op } = require('sequelize');
const AuctionFacade = require('../facades/AuctionFacade');

/**
 * AuctionScheduler — Auto-Settlement Timer
 * Periodically checks for expired auctions and settles them automatically.
 */
class AuctionScheduler {
    constructor(intervalMs = 30000) { // Default: check every 30 seconds
        this.intervalMs = intervalMs;
        this.timer = null;
    }

    start() {
        console.log(`[AuctionScheduler] Started. Checking every ${this.intervalMs / 1000}s for expired auctions.`);
        this.timer = setInterval(() => this.checkExpiredAuctions(), this.intervalMs);
        // Also run immediately on start
        this.checkExpiredAuctions();
    }

    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
            console.log('[AuctionScheduler] Stopped.');
        }
    }

    async checkExpiredAuctions() {
        try {
            const expiredAuctions = await Auction.findAll({
                where: {
                    status: 'Active',
                    endTime: { [Op.lt]: new Date() }
                }
            });

            if (expiredAuctions.length === 0) return;

            console.log(`[AuctionScheduler] Found ${expiredAuctions.length} expired auction(s). Settling...`);

            for (const auction of expiredAuctions) {
                try {
                    await AuctionFacade.settleAuction(auction.id);
                    console.log(`[AuctionScheduler] ✓ Settled auction ${auction.id}`);
                } catch (err) {
                    console.error(`[AuctionScheduler] ✗ Failed to settle auction ${auction.id}: ${err.message}`);
                }
            }
        } catch (err) {
            console.error('[AuctionScheduler] Error checking expired auctions:', err.message);
        }
    }
}

module.exports = new AuctionScheduler();
