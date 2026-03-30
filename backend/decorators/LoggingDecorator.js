/**
 * Decorator Pattern — LoggingDecorator
 * Wraps any service with automatic entry/exit logging for every method call.
 * Uses ES6 Proxy to intercept method invocations transparently.
 */
class LoggingDecorator {
    /**
     * Wrap a service instance with logging.
     * @param {object} service - The service to wrap
     * @param {string} [serviceName] - Optional name for log messages
     * @returns {Proxy} A proxied version of the service
     */
    static wrap(service, serviceName = null) {
        const name = serviceName || service.constructor.name || 'UnknownService';

        return new Proxy(service, {
            get(target, property, receiver) {
                const original = target[property];

                // Only intercept function calls, not property access
                if (typeof original !== 'function') {
                    return original;
                }

                return async function (...args) {
                    const timestamp = new Date().toISOString();
                    console.log(`[LOG][${name}] ▶ ${property}() called at ${timestamp}`);
                    console.log(`[LOG][${name}]   Args: ${JSON.stringify(args).substring(0, 200)}`);

                    try {
                        const result = await original.apply(target, args);
                        console.log(`[LOG][${name}] ◀ ${property}() completed successfully.`);
                        return result;
                    } catch (error) {
                        console.error(`[LOG][${name}] ✖ ${property}() threw: ${error.message}`);
                        throw error;
                    }
                };
            }
        });
    }
}

module.exports = LoggingDecorator;
