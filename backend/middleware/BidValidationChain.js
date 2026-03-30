/**
 * Chain of Responsibility Pattern — BidValidationChain
 * 
 * Each handler checks one specific concern and passes to the next.
 * Handlers implement: setNext(handler) and handle(request).
 */

// ─── Abstract Handler ────────────────────────────────────────────────

class BaseBidHandler {
    constructor() {
        this.nextHandler = null;
    }

    setNext(handler) {
        this.nextHandler = handler;
        return handler; // enables chaining: h1.setNext(h2).setNext(h3)
    }

    async handle(request) {
        if (this.nextHandler) {
            return this.nextHandler.handle(request);
        }
        return { valid: true };
    }
}

// ─── Concrete Handlers ───────────────────────────────────────────────

/**
 * Handler 1: Checks if the auction exists and is Active.
 */
class AuctionActiveHandler extends BaseBidHandler {
    async handle(request) {
        const { auction } = request;
        if (!auction) {
            throw new Error('[Validation] Auction not found.');
        }
        if (auction.status !== 'Active') {
            throw new Error('[Validation] Auction is not active.');
        }
        console.log('[ChainOfResponsibility] ✓ AuctionActiveHandler passed.');
        return super.handle(request);
    }
}

/**
 * Handler 2: Checks if the auction has not expired.
 */
class AuctionNotExpiredHandler extends BaseBidHandler {
    async handle(request) {
        const { auction } = request;
        if (new Date() > new Date(auction.endTime)) {
            throw new Error('[Validation] Auction has already ended.');
        }
        console.log('[ChainOfResponsibility] ✓ AuctionNotExpiredHandler passed.');
        return super.handle(request);
    }
}

/**
 * Handler 3: Checks if the user has sufficient wallet balance.
 */
class SufficientBalanceHandler extends BaseBidHandler {
    async handle(request) {
        const { user, amount } = request;
        if (!user) {
            throw new Error('[Validation] User not found.');
        }
        if (user.walletBalance < amount) {
            throw new Error(`[Validation] Insufficient balance. Required: $${amount}, Available: $${user.walletBalance}`);
        }
        console.log('[ChainOfResponsibility] ✓ SufficientBalanceHandler passed.');
        return super.handle(request);
    }
}

/**
 * Handler 4: Checks if the bid amount meets the minimum required bid.
 */
class MinimumBidHandler extends BaseBidHandler {
    async handle(request) {
        const { auction, amount } = request;
        if (auction.strategyType === 'English' && amount <= auction.currentHighestBid) {
            throw new Error(`[Validation] Bid must be higher than current highest bid of $${auction.currentHighestBid}.`);
        }
        if (amount <= 0) {
            throw new Error('[Validation] Bid amount must be a positive number.');
        }
        console.log('[ChainOfResponsibility] ✓ MinimumBidHandler passed.');
        return super.handle(request);
    }
}

// ─── Chain Builder ───────────────────────────────────────────────────

/**
 * Builds and returns a configured validation chain.
 * @returns {BaseBidHandler} The head of the chain
 */
function buildBidValidationChain() {
    const auctionActive = new AuctionActiveHandler();
    const auctionNotExpired = new AuctionNotExpiredHandler();
    const sufficientBalance = new SufficientBalanceHandler();
    const minimumBid = new MinimumBidHandler();

    // Link the chain
    auctionActive
        .setNext(auctionNotExpired)
        .setNext(sufficientBalance)
        .setNext(minimumBid);

    return auctionActive; // Return head of chain
}

module.exports = {
    buildBidValidationChain,
    // Export individual handlers for testing
    AuctionActiveHandler,
    AuctionNotExpiredHandler,
    SufficientBalanceHandler,
    MinimumBidHandler,
    BaseBidHandler
};
