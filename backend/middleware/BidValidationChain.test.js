const {
    buildBidValidationChain,
    AuctionActiveHandler,
    AuctionNotExpiredHandler,
    SufficientBalanceHandler,
    MinimumBidHandler,
    BaseBidHandler,
} = require('./BidValidationChain');

describe('BidValidationChain', () => {
    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    // --- BaseBidHandler ---
    describe('BaseBidHandler', () => {
        test('handle() should return valid:true when no next handler', async () => {
            const handler = new BaseBidHandler();
            const result = await handler.handle({});
            expect(result).toEqual({ valid: true });
        });

        test('setNext() should return the next handler (enables chaining)', () => {
            const h1 = new BaseBidHandler();
            const h2 = new BaseBidHandler();
            const returned = h1.setNext(h2);
            expect(returned).toBe(h2);
        });
    });

    // --- AuctionActiveHandler ---
    describe('AuctionActiveHandler', () => {
        test('should pass if auction exists and is Active', async () => {
            const handler = new AuctionActiveHandler();
            const result = await handler.handle({ auction: { status: 'Active' } });
            expect(result).toEqual({ valid: true });
        });

        test('should throw if auction is null', async () => {
            const handler = new AuctionActiveHandler();
            await expect(handler.handle({ auction: null }))
                .rejects.toThrow('[Validation] Auction not found.');
        });

        test('should throw if auction is not Active', async () => {
            const handler = new AuctionActiveHandler();
            await expect(handler.handle({ auction: { status: 'Closed' } }))
                .rejects.toThrow('[Validation] Auction is not active.');
        });
    });

    // --- AuctionNotExpiredHandler ---
    describe('AuctionNotExpiredHandler', () => {
        test('should pass if auction has not expired', async () => {
            const handler = new AuctionNotExpiredHandler();
            const futureAuction = { endTime: new Date(Date.now() + 86400000) };
            const result = await handler.handle({ auction: futureAuction });
            expect(result).toEqual({ valid: true });
        });

        test('should throw if auction has expired', async () => {
            const handler = new AuctionNotExpiredHandler();
            const pastAuction = { endTime: new Date(Date.now() - 86400000) };
            await expect(handler.handle({ auction: pastAuction }))
                .rejects.toThrow('[Validation] Auction has already ended.');
        });
    });

    // --- SufficientBalanceHandler ---
    describe('SufficientBalanceHandler', () => {
        test('should pass if user has sufficient balance', async () => {
            const handler = new SufficientBalanceHandler();
            const result = await handler.handle({ user: { walletBalance: 200 }, amount: 100 });
            expect(result).toEqual({ valid: true });
        });

        test('should throw if user is null', async () => {
            const handler = new SufficientBalanceHandler();
            await expect(handler.handle({ user: null, amount: 100 }))
                .rejects.toThrow('[Validation] User not found.');
        });

        test('should throw if balance is insufficient', async () => {
            const handler = new SufficientBalanceHandler();
            await expect(handler.handle({ user: { walletBalance: 50 }, amount: 100 }))
                .rejects.toThrow('[Validation] Insufficient balance');
        });
    });

    // --- MinimumBidHandler ---
    describe('MinimumBidHandler', () => {
        test('should pass for English auction with bid above current highest', async () => {
            const handler = new MinimumBidHandler();
            const result = await handler.handle({
                auction: { strategyType: 'English', currentHighestBid: 100 },
                amount: 150,
            });
            expect(result).toEqual({ valid: true });
        });

        test('should throw for English auction with bid equal to current highest', async () => {
            const handler = new MinimumBidHandler();
            await expect(handler.handle({
                auction: { strategyType: 'English', currentHighestBid: 100 },
                amount: 100,
            })).rejects.toThrow('[Validation] Bid must be higher than current highest bid');
        });

        test('should throw if amount is zero', async () => {
            const handler = new MinimumBidHandler();
            await expect(handler.handle({
                auction: { strategyType: 'Vickrey', currentHighestBid: 0 },
                amount: 0,
            })).rejects.toThrow('[Validation] Bid amount must be a positive number.');
        });

        test('should pass for Vickrey auction below current highest but positive', async () => {
            const handler = new MinimumBidHandler();
            const result = await handler.handle({
                auction: { strategyType: 'Vickrey', currentHighestBid: 200 },
                amount: 100,
            });
            expect(result).toEqual({ valid: true });
        });
    });

    // --- Full Chain Integration ---
    describe('buildBidValidationChain() - full chain', () => {
        test('should pass valid request through entire chain', async () => {
            const chain = buildBidValidationChain();
            const result = await chain.handle({
                auction: {
                    status: 'Active',
                    endTime: new Date(Date.now() + 86400000),
                    strategyType: 'English',
                    currentHighestBid: 100,
                },
                user: { walletBalance: 500 },
                amount: 150,
            });
            expect(result).toEqual({ valid: true });
        });

        test('should fail at first invalid handler', async () => {
            const chain = buildBidValidationChain();
            await expect(chain.handle({
                auction: null,
                user: { walletBalance: 500 },
                amount: 150,
            })).rejects.toThrow('[Validation] Auction not found.');
        });
    });
});
