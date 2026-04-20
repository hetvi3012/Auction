const AuctionSubject = require('./AuctionSubject');

describe('AuctionSubject', () => {
    beforeEach(() => {
        // Reset observers before each test
        AuctionSubject.observers = [];
    });

    // --- addObserver / removeObserver ---
    describe('addObserver()', () => {
        test('should add an observer', () => {
            const observer = { onNewBid: jest.fn() };
            AuctionSubject.addObserver(observer);
            expect(AuctionSubject.observers).toContain(observer);
        });

        test('should add multiple observers', () => {
            const obs1 = {};
            const obs2 = {};
            AuctionSubject.addObserver(obs1);
            AuctionSubject.addObserver(obs2);
            expect(AuctionSubject.observers).toHaveLength(2);
        });
    });

    describe('removeObserver()', () => {
        test('should remove the specified observer', () => {
            const obs1 = {};
            const obs2 = {};
            AuctionSubject.addObserver(obs1);
            AuctionSubject.addObserver(obs2);
            AuctionSubject.removeObserver(obs1);
            expect(AuctionSubject.observers).toEqual([obs2]);
        });

        test('should do nothing if observer not found', () => {
            const obs1 = {};
            AuctionSubject.addObserver(obs1);
            AuctionSubject.removeObserver({});
            expect(AuctionSubject.observers).toHaveLength(1);
        });
    });

    // --- notifyNewBid ---
    describe('notifyNewBid()', () => {
        test('should call onNewBid on all observers that have the method', () => {
            const obs1 = { onNewBid: jest.fn() };
            const obs2 = { onNewBid: jest.fn() };
            AuctionSubject.addObserver(obs1);
            AuctionSubject.addObserver(obs2);

            const bidData = { auctionId: 'a1', amount: 100 };
            AuctionSubject.notifyNewBid(bidData);

            expect(obs1.onNewBid).toHaveBeenCalledWith(bidData);
            expect(obs2.onNewBid).toHaveBeenCalledWith(bidData);
        });

        test('should skip observers without onNewBid method', () => {
            const obs1 = { onNewBid: jest.fn() };
            const obs2 = {}; // no onNewBid
            AuctionSubject.addObserver(obs1);
            AuctionSubject.addObserver(obs2);

            const bidData = { auctionId: 'a1', amount: 100 };
            expect(() => AuctionSubject.notifyNewBid(bidData)).not.toThrow();
            expect(obs1.onNewBid).toHaveBeenCalledWith(bidData);
        });
    });

    // --- notifyAuctionClosed ---
    describe('notifyAuctionClosed()', () => {
        test('should call onAuctionClosed on all observers that have the method', () => {
            const obs1 = { onAuctionClosed: jest.fn() };
            const obs2 = { onAuctionClosed: jest.fn() };
            AuctionSubject.addObserver(obs1);
            AuctionSubject.addObserver(obs2);

            const auctionData = { auctionId: 'a1', finalPrice: 200 };
            AuctionSubject.notifyAuctionClosed(auctionData);

            expect(obs1.onAuctionClosed).toHaveBeenCalledWith(auctionData);
            expect(obs2.onAuctionClosed).toHaveBeenCalledWith(auctionData);
        });

        test('should skip observers without onAuctionClosed method', () => {
            const obs1 = {};
            AuctionSubject.addObserver(obs1);
            expect(() => AuctionSubject.notifyAuctionClosed({ auctionId: 'a1' })).not.toThrow();
        });
    });
});
