class LoggerService {
    static getTimestamp() {
        return new Date().toISOString();
    }

    static info(message, data = null) {
        const log = {
            timestamp: this.getTimestamp(),
            level: 'INFO',
            message
        };
        if (data) log.data = data;
        console.log(JSON.stringify(log));
    }

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