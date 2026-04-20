const LoggingDecorator = require('./LoggingDecorator');

describe('LoggingDecorator', () => {
    let consoleSpy;
    let consoleErrorSpy;

    beforeEach(() => {
        consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('wrap()', () => {
        test('should proxy method calls and return the correct result', async () => {
            const service = { greet: jest.fn().mockResolvedValue('hello') };
            const wrapped = LoggingDecorator.wrap(service, 'TestService');

            const result = await wrapped.greet('world');
            expect(result).toBe('hello');
            expect(service.greet).toHaveBeenCalledWith('world');
        });

        test('should log entry and exit for successful calls', async () => {
            const service = { doWork: jest.fn().mockResolvedValue('done') };
            const wrapped = LoggingDecorator.wrap(service, 'MyService');

            await wrapped.doWork();

            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[MyService]'));
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('doWork()'));
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('completed successfully'));
        });

        test('should log error and rethrow on failure', async () => {
            const service = { fail: jest.fn().mockRejectedValue(new Error('boom')) };
            const wrapped = LoggingDecorator.wrap(service, 'FailService');

            await expect(wrapped.fail()).rejects.toThrow('boom');
            expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('boom'));
        });

        test('should not intercept non-function properties', () => {
            const service = { name: 'test', count: 42 };
            const wrapped = LoggingDecorator.wrap(service, 'PropService');
            expect(wrapped.name).toBe('test');
            expect(wrapped.count).toBe(42);
        });

        test('should use constructor name if no serviceName provided', async () => {
            class FooService {
                async bar() { return 1; }
            }
            const service = new FooService();
            const wrapped = LoggingDecorator.wrap(service);

            await wrapped.bar();
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('FooService'));
        });
    });
});
