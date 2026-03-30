const EnglishAuctionStrategy = require('../services/EnglishAuctionStrategy');
const VickreyAuctionStrategy = require('../services/VickreyAuctionStrategy');

/**
 * Factory Pattern — StrategyFactory
 * Centralises the creation of auction strategy objects.
 * Maps strategy type strings to concrete strategy classes.
 */
class StrategyFactory {
    constructor() {
        this.strategies = new Map();
        this.strategies.set('English', EnglishAuctionStrategy);
        this.strategies.set('Vickrey', VickreyAuctionStrategy);
    }

    /**
     * Register a new strategy type at runtime (open for extension).
     * @param {string} type 
     * @param {class} StrategyClass 
     */
    registerStrategy(type, StrategyClass) {
        this.strategies.set(type, StrategyClass);
    }

    /**
     * Create and return a strategy instance for the given type.
     * @param {string} type - 'English' | 'Vickrey'
     * @returns {object} Strategy instance
     */
    createStrategy(type) {
        const StrategyClass = this.strategies.get(type);
        if (!StrategyClass) {
            throw new Error(`Unknown auction strategy type: ${type}. Available: ${[...this.strategies.keys()].join(', ')}`);
        }
        return new StrategyClass();
    }

    /**
     * Returns all registered strategy type names.
     * @returns {string[]}
     */
    getAvailableTypes() {
        return [...this.strategies.keys()];
    }
}

module.exports = new StrategyFactory();
