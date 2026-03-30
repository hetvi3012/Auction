const StrategyFactory = require('../factories/StrategyFactory');

/**
 * Builder Pattern — AuctionBuilder
 * Provides a fluent API for constructing auction configuration objects.
 * Validates all required fields before producing the final config.
 */
class AuctionBuilder {
    constructor() {
        this.config = {};
    }

    /**
     * Set the ticket to be auctioned.
     * @param {string} ticketId 
     * @returns {AuctionBuilder}
     */
    setTicket(ticketId) {
        this.config.ticketId = ticketId;
        return this;
    }

    /**
     * Set the auction strategy type.
     * @param {string} strategyType - 'English' | 'Vickrey'
     * @returns {AuctionBuilder}
     */
    setStrategy(strategyType) {
        // Validate that the strategy type is registered
        const availableTypes = StrategyFactory.getAvailableTypes();
        if (!availableTypes.includes(strategyType)) {
            throw new Error(`Invalid strategy type: ${strategyType}. Available: ${availableTypes.join(', ')}`);
        }
        this.config.strategyType = strategyType;
        return this;
    }

    /**
     * Set the starting price.
     * @param {number} price 
     * @returns {AuctionBuilder}
     */
    setStartingPrice(price) {
        if (typeof price !== 'number' || price <= 0) {
            throw new Error('Starting price must be a positive number.');
        }
        this.config.startingPrice = price;
        return this;
    }

    /**
     * Set the auction end time.
     * @param {Date|string} endTime 
     * @returns {AuctionBuilder}
     */
    setEndTime(endTime) {
        const parsedDate = new Date(endTime);
        if (isNaN(parsedDate.getTime())) {
            throw new Error('Invalid end time.');
        }
        if (parsedDate <= new Date()) {
            throw new Error('End time must be in the future.');
        }
        this.config.endTime = parsedDate;
        return this;
    }

    /**
     * Validate and return the final configuration object.
     * @returns {object} { ticketId, strategyType, startingPrice, endTime }
     */
    build() {
        const required = ['ticketId', 'strategyType', 'startingPrice', 'endTime'];
        const missing = required.filter(field => !this.config[field]);

        if (missing.length > 0) {
            throw new Error(`AuctionBuilder: Missing required fields: ${missing.join(', ')}`);
        }

        // Return a frozen copy so the config cannot be mutated after build
        const result = Object.freeze({ ...this.config });

        // Reset internal state for reuse
        this.config = {};

        return result;
    }
}

module.exports = AuctionBuilder;
