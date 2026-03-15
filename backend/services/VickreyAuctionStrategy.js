class VickreyAuctionStrategy {
    /**
     * In a Vickrey (sealed-bid) auction, any bid is valid as long as the user has the funds.
     * We don't compare against a "current highest" because bids are sealed until the end.
     */
    validateBid(currentHighest, newBid, walletBalance) {
        if (newBid <= 0) {
            throw new Error('Bid must be strictly positive.');
        }
        if (walletBalance < newBid) {
            throw new Error('Insufficient wallet balance to place this bid.');
        }
        return true;
    }

    /**
     * Determines the winner and final price from a list of bids.
     * The highest bidder wins, but pays the SECOND highest bid price.
     */
    determineWinnerAndPrice(bids) {
        if (!bids || bids.length === 0) return null;

        // Sort descending by amount
        const sortedBids = [...bids].sort((a, b) => b.amount - a.amount);
        const winningBid = sortedBids[0];

        // If there's only one bid, they pay their bid (or a reserve price if implemented, but here just their bid)
        const finalPrice = sortedBids.length > 1 ? sortedBids[1].amount : winningBid.amount;

        return {
            winnerId: winningBid.bidderId,
            finalPrice: finalPrice
        };
    }
}

module.exports = VickreyAuctionStrategy;
