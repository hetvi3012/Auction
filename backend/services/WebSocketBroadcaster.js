class WebSocketBroadcaster {
    constructor(io) {
        this.io = io;
    }

    onNewBid(bidData) {
        if (this.io) {
            this.io.to(bidData.auctionId.toString()).emit('new_bid', bidData);
            console.log(`[WebSocket] Broadcasted new bid to room ${bidData.auctionId}: $${bidData.amount}`);
        }
    }

    onAuctionClosed(auctionData) {
        if (this.io) {
            this.io.to(auctionData.auctionId.toString()).emit('auction_closed', auctionData);
            console.log(`[WebSocket] Broadcasted auction closure to room ${auctionData.auctionId}`);
        }
    }
}

module.exports = WebSocketBroadcaster;
