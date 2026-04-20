const WebSocketBroadcaster = require('./WebSocketBroadcaster');

describe('WebSocketBroadcaster', () => {
    let mockIo;
    let mockRoom;

    beforeEach(() => {
        mockRoom = { emit: jest.fn() };
        mockIo = { to: jest.fn(() => mockRoom) };
        jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    // --- onNewBid ---
    describe('onNewBid()', () => {
        test('should emit new_bid event to the correct auction room', () => {
            const broadcaster = new WebSocketBroadcaster(mockIo);
            const bidData = { auctionId: 123, amount: 100 };
            broadcaster.onNewBid(bidData);

            expect(mockIo.to).toHaveBeenCalledWith('123');
            expect(mockRoom.emit).toHaveBeenCalledWith('new_bid', bidData);
        });

        test('should not throw if io is null', () => {
            const broadcaster = new WebSocketBroadcaster(null);
            expect(() => broadcaster.onNewBid({ auctionId: 1, amount: 50 })).not.toThrow();
        });
    });

    // --- onAuctionClosed ---
    describe('onAuctionClosed()', () => {
        test('should emit auction_closed event to the correct room', () => {
            const broadcaster = new WebSocketBroadcaster(mockIo);
            const auctionData = { auctionId: 456, finalPrice: 200 };
            broadcaster.onAuctionClosed(auctionData);

            expect(mockIo.to).toHaveBeenCalledWith('456');
            expect(mockRoom.emit).toHaveBeenCalledWith('auction_closed', auctionData);
        });

        test('should not throw if io is null', () => {
            const broadcaster = new WebSocketBroadcaster(null);
            expect(() => broadcaster.onAuctionClosed({ auctionId: 1 })).not.toThrow();
        });
    });
});
