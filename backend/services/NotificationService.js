/**
 * Observer Pattern — NotificationService
 * A new observer that simulates email/push notifications.
 * Implements the same interface as WebSocketBroadcaster (onNewBid, onAuctionClosed).
 */
class NotificationService {
    
    /**
     * Called when a new bid is placed.
     * @param {object} bidData - { auctionId, bidderId, amount, timestamp, isProxyAutoBid? }
     */
    onNewBid(bidData) {
        const bidType = bidData.isProxyAutoBid ? 'PROXY AUTO-BID' : 'MANUAL BID';
        console.log(`[NotificationService] 📬 New ${bidType} Alert:`);
        console.log(`   Auction: ${bidData.auctionId}`);
        console.log(`   Bidder: ${bidData.bidderId}`);
        console.log(`   Amount: $${bidData.amount}`);
        console.log(`   Time: ${bidData.timestamp}`);
        // In production: send email, push notification, SMS, etc.
    }

    /**
     * Called when an auction is closed/settled.
     * @param {object} auctionData - { auctionId, winningBidderId, finalPrice, message? }
     */
    onAuctionClosed(auctionData) {
        if (auctionData.winningBidderId) {
            console.log(`[NotificationService] 🏆 Auction Closed Alert:`);
            console.log(`   Auction: ${auctionData.auctionId}`);
            console.log(`   Winner: ${auctionData.winningBidderId}`);
            console.log(`   Final Price: $${auctionData.finalPrice}`);
            // In production: send congratulations email to winner, 
            // and "outbid" notifications to losers
        } else {
            console.log(`[NotificationService] 📭 Auction Closed (No Bids):`);
            console.log(`   Auction: ${auctionData.auctionId}`);
            console.log(`   ${auctionData.message || 'No bids were placed.'}`);
        }
    }
}

module.exports = NotificationService;
