const CommandInvoker = require('./CommandInvoker');

describe('CommandInvoker', () => {
    beforeEach(() => {
        CommandInvoker.clearHistory();
        jest.spyOn(console, 'log').mockImplementation();
        jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    // --- executeCommand ---
    describe('executeCommand()', () => {
        test('should call execute() on the command and return the result', async () => {
            const mockCommand = {
                constructor: { name: 'TestCommand' },
                execute: jest.fn().mockResolvedValue({ success: true }),
            };
            const result = await CommandInvoker.executeCommand(mockCommand);
            expect(mockCommand.execute).toHaveBeenCalledTimes(1);
            expect(result).toEqual({ success: true });
        });

        test('should record successful command in history', async () => {
            const mockCommand = {
                constructor: { name: 'TestCommand' },
                execute: jest.fn().mockResolvedValue('ok'),
            };
            await CommandInvoker.executeCommand(mockCommand);
            const history = CommandInvoker.getHistory();
            expect(history).toHaveLength(1);
            expect(history[0].command).toBe('TestCommand');
            expect(history[0].status).toBe('SUCCESS');
        });

        test('should record failed command in history and rethrow error', async () => {
            const mockCommand = {
                constructor: { name: 'FailCommand' },
                execute: jest.fn().mockRejectedValue(new Error('Something broke')),
            };
            await expect(CommandInvoker.executeCommand(mockCommand))
                .rejects.toThrow('Something broke');

            const history = CommandInvoker.getHistory();
            expect(history).toHaveLength(1);
            expect(history[0].command).toBe('FailCommand');
            expect(history[0].status).toBe('FAILED');
            expect(history[0].error).toBe('Something broke');
        });
    });

    // --- getHistory ---
    describe('getHistory()', () => {
        test('should return a copy of the history array', async () => {
            const mockCmd = {
                constructor: { name: 'Cmd' },
                execute: jest.fn().mockResolvedValue(null),
            };
            await CommandInvoker.executeCommand(mockCmd);
            const h1 = CommandInvoker.getHistory();
            const h2 = CommandInvoker.getHistory();
            expect(h1).toEqual(h2);
            expect(h1).not.toBe(h2); // Different array references
        });
    });

    // --- getRecentHistory ---
    describe('getRecentHistory()', () => {
        test('should return the last N commands', async () => {
            for (let i = 0; i < 5; i++) {
                const cmd = {
                    constructor: { name: `Cmd${i}` },
                    execute: jest.fn().mockResolvedValue(null),
                };
                await CommandInvoker.executeCommand(cmd);
            }
            const recent = CommandInvoker.getRecentHistory(2);
            expect(recent).toHaveLength(2);
            expect(recent[0].command).toBe('Cmd3');
            expect(recent[1].command).toBe('Cmd4');
        });
    });

    // --- clearHistory ---
    describe('clearHistory()', () => {
        test('should empty the history', async () => {
            const cmd = {
                constructor: { name: 'Cmd' },
                execute: jest.fn().mockResolvedValue(null),
            };
            await CommandInvoker.executeCommand(cmd);
            expect(CommandInvoker.getHistory()).toHaveLength(1);
            CommandInvoker.clearHistory();
            expect(CommandInvoker.getHistory()).toHaveLength(0);
        });
    });
});
