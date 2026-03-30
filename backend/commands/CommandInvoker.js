/**
 * Command Pattern — CommandInvoker
 * Accepts any command and calls execute() on it.
 * Maintains a history of executed commands for auditing.
 */
class CommandInvoker {
    constructor() {
        this.history = [];
    }

    /**
     * Execute a command and record it in the history.
     * @param {object} command - Any command object with an execute() method
     * @returns {Promise<*>} Result of the command execution
     */
    async executeCommand(command) {
        const commandName = command.constructor.name;
        const timestamp = new Date().toISOString();

        console.log(`[CommandInvoker] Executing: ${commandName} at ${timestamp}`);

        try {
            const result = await command.execute();

            this.history.push({
                command: commandName,
                timestamp,
                status: 'SUCCESS'
            });

            console.log(`[CommandInvoker] ${commandName} completed successfully.`);
            return result;

        } catch (error) {
            this.history.push({
                command: commandName,
                timestamp,
                status: 'FAILED',
                error: error.message
            });

            console.error(`[CommandInvoker] ${commandName} failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Get the full command execution history.
     * @returns {Array<object>}
     */
    getHistory() {
        return [...this.history];
    }

    /**
     * Get the last N executed commands.
     * @param {number} n 
     * @returns {Array<object>}
     */
    getRecentHistory(n = 10) {
        return this.history.slice(-n);
    }

    /**
     * Clear the command history.
     */
    clearHistory() {
        this.history = [];
    }
}

module.exports = new CommandInvoker();
