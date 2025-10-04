import logger from '../utils/logger.js';

/**
 * Request logging middleware
 * Logs all HTTP requests with timing information
 */
export const requestLogger = (req, res, next) => {
    const startTime = Date.now();
    
    // Log request start
    logger.debug('Request started', {
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress,
        userId: req.user?.userId || 'anonymous'
    });

    // Override res.end to capture response time
    const originalEnd = res.end;
    res.end = function(...args) {
        const responseTime = Date.now() - startTime;
        
        // Log the request completion
        logger.http(req, res, responseTime);
        
        // Call original end method
        originalEnd.apply(this, args);
    };

    next();
};

/**
 * Error logging middleware
 * Should be placed after all routes but before the final error handler
 */
export const errorLogger = (err, req, res, next) => {
    // Log the error with request context
    logger.error('Request error occurred', err, {
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress,
        userId: req.user?.userId || 'anonymous',
        body: req.body,
        params: req.params,
        query: req.query
    });

    // Pass error to next middleware
    next(err);
};
