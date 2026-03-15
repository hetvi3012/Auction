class EnglishAuctionStrategy {
    /**
     * In an English auction, a new bid must be higher than the current highest bid.
     * The bidder must also have sufficient wallet balance.
     */
    validateBid(currentHighest, newBid, walletBalance) {
        if (newBid <= currentHighest) {
            throw new Error('Bid must be higher than the current highest bid.');
        }
        if (walletBalance < newBid) {
            throw new Error('Insufficient wallet balance to place this bid.');
        }
        return true;
    }

    /**
     * Determines the winner and final price from a list of bids.
     * @param {Array} bids - Array of bid objects (assumed sorted descending by amount, or we sort here)
     */
    determineWinnerAndPrice(bids) {
        if (!bids || bids.length === 0) return null;
        
        // Ensure bids are sorted descending by amount
        const sortedBids = [...bids].sort((a, b) => b.amount - a.amount);
        const winningBid = sortedBids[0];

        return {
            winnerId: winningBid.bidderId,
            finalPrice: winningBid.amount
        };
    }
}

module.exports = EnglishAuctionStrategy;
