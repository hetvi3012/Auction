class AuctionSubject {
    constructor() {
        this.observers = [];
    }

    addObserver(observer) {
        this.observers.push(observer);
    }

    removeObserver(observerToRemove) {
        this.observers = this.observers.filter(observer => observer !== observerToRemove);
    }

    notifyNewBid(bidData) {
        this.observers.forEach(observer => {
            if (typeof observer.onNewBid === 'function') {
                observer.onNewBid(bidData);
            }
        });
    }

    notifyAuctionClosed(auctionData) {
        this.observers.forEach(observer => {
            if (typeof observer.onAuctionClosed === 'function') {
                observer.onAuctionClosed(auctionData);
            }
        });
    }
}

module.exports = new AuctionSubject();
