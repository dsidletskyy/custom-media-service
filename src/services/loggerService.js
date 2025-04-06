/**
 * Service for logging application events and errors
 * Provides structured JSON logging with timestamps and log levels
 * 
 * @class LoggerService
 */
class LoggerService {
    /**
     * Gets the current timestamp in ISO format
     * 
     * @returns {string} Current timestamp in ISO format
     */
    static getTimestamp() {
        return new Date().toISOString();
    }

    /**
     * Logs an informational message
     * 
     * @param {string} message - The message to log
     * @param {Object} [data=null] - Optional data to include in the log
     * @returns {void}
     */
    static info(message, data = null) {
        const log = {
            timestamp: this.getTimestamp(),
            level: 'INFO',
            message
        };
        if (data) log.data = data;
        console.log(JSON.stringify(log));
    }

    /**
     * Logs an error message with error details
     * 
     * @param {string} message - The error message to log
     * @param {Error} [error=null] - Optional error object to include in the log
     * @returns {void}
     */
    static error(message, error = null) {
        const log = {
            timestamp: this.getTimestamp(),
            level: 'ERROR',
            message
        };
        if (error) {
            log.error = {
                message: error.message,
                stack: error.stack
            };
        }
        console.error(JSON.stringify(log));
    }

    /**
     * Logs a debug message (only in non-production environments)
     * 
     * @param {string} message - The debug message to log
     * @param {Object} [data=null] - Optional data to include in the log
     * @returns {void}
     */
    static debug(message, data = null) {
        if (process.env.NODE_ENV !== 'production') {
            const log = {
                timestamp: this.getTimestamp(),
                level: 'DEBUG',
                message
            };
            if (data) log.data = data;
            console.debug(JSON.stringify(log));
        }
    }
}

module.exports = LoggerService; 