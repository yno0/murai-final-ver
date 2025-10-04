import fs from 'fs';
import path from 'path';

class Logger {
    constructor() {
        this.logDir = path.join(process.cwd(), 'logs');
        this.ensureLogDirectory();
    }

    ensureLogDirectory() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    formatMessage(level, message, meta = {}) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            ...meta
        };
        return JSON.stringify(logEntry);
    }

    writeToFile(filename, message) {
        const logFile = path.join(this.logDir, filename);
        const logMessage = message + '\n';
        
        try {
            fs.appendFileSync(logFile, logMessage);
        } catch (error) {
            console.error('Failed to write to log file:', error);
        }
    }

    info(message, meta = {}) {
        const formattedMessage = this.formatMessage('INFO', message, meta);
        console.log(`ℹ️  ${message}`, meta);
        this.writeToFile('app.log', formattedMessage);
    }

    error(message, error = null, meta = {}) {
        const errorMeta = {
            ...meta,
            ...(error && {
                error: {
                    message: error.message,
                    stack: error.stack,
                    name: error.name
                }
            })
        };
        
        const formattedMessage = this.formatMessage('ERROR', message, errorMeta);
        console.error(`❌ ${message}`, error || '', meta);
        this.writeToFile('error.log', formattedMessage);
        this.writeToFile('app.log', formattedMessage);
    }

    warn(message, meta = {}) {
        const formattedMessage = this.formatMessage('WARN', message, meta);
        console.warn(`⚠️  ${message}`, meta);
        this.writeToFile('app.log', formattedMessage);
    }

    debug(message, meta = {}) {
        if (process.env.NODE_ENV === 'development') {
            const formattedMessage = this.formatMessage('DEBUG', message, meta);
            console.debug(`🐛 ${message}`, meta);
            this.writeToFile('debug.log', formattedMessage);
        }
    }

    success(message, meta = {}) {
        const formattedMessage = this.formatMessage('SUCCESS', message, meta);
        console.log(`✅ ${message}`, meta);
        this.writeToFile('app.log', formattedMessage);
    }

    http(req, res, responseTime) {
        const logData = {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            responseTime: `${responseTime}ms`,
            userAgent: req.get('User-Agent'),
            ip: req.ip || req.connection.remoteAddress,
            userId: req.user?.userId || 'anonymous'
        };

        const message = `${req.method} ${req.url} ${res.statusCode} - ${responseTime}ms`;
        const formattedMessage = this.formatMessage('HTTP', message, logData);
        
        // Color code based on status
        if (res.statusCode >= 500) {
            console.error(`🔴 ${message}`);
        } else if (res.statusCode >= 400) {
            console.warn(`🟡 ${message}`);
        } else {
            console.log(`🟢 ${message}`);
        }

        this.writeToFile('access.log', formattedMessage);
    }

    security(message, meta = {}) {
        const formattedMessage = this.formatMessage('SECURITY', message, meta);
        console.warn(`🔒 SECURITY: ${message}`, meta);
        this.writeToFile('security.log', formattedMessage);
        this.writeToFile('app.log', formattedMessage);
    }
}

// Create and export singleton instance
const logger = new Logger();
export default logger;
