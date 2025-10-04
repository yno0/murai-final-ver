import logger from './logger.js';

/**
 * Standardized API response utility
 */
class ResponseUtil {
    /**
     * Send success response
     * @param {Object} res - Express response object
     * @param {*} data - Response data
     * @param {string} message - Success message
     * @param {number} statusCode - HTTP status code (default: 200)
     */
    static success(res, data = null, message = 'Success', statusCode = 200) {
        const response = {
            success: true,
            message,
            ...(data && { data }),
            timestamp: new Date().toISOString()
        };

        logger.debug('Success response sent', { statusCode, message, hasData: !!data });
        return res.status(statusCode).json(response);
    }

    /**
     * Send error response
     * @param {Object} res - Express response object
     * @param {string} message - Error message
     * @param {number} statusCode - HTTP status code (default: 500)
     * @param {*} error - Error details (only in development)
     * @param {string} errorCode - Custom error code
     */
    static error(res, message = 'Internal server error', statusCode = 500, error = null, errorCode = null) {
        const response = {
            success: false,
            message,
            ...(errorCode && { errorCode }),
            timestamp: new Date().toISOString()
        };

        // Include error details only in development
        if (process.env.NODE_ENV === 'development' && error) {
            response.error = {
                message: error.message,
                stack: error.stack,
                name: error.name
            };
        }

        logger.error('Error response sent', error, { statusCode, message, errorCode });
        return res.status(statusCode).json(response);
    }

    /**
     * Send validation error response
     * @param {Object} res - Express response object
     * @param {Array|Object} errors - Validation errors
     * @param {string} message - Error message
     */
    static validationError(res, errors, message = 'Validation failed') {
        const response = {
            success: false,
            message,
            errors: Array.isArray(errors) ? errors : [errors],
            timestamp: new Date().toISOString()
        };

        logger.warn('Validation error response sent', { message, errors });
        return res.status(400).json(response);
    }

    /**
     * Send unauthorized response
     * @param {Object} res - Express response object
     * @param {string} message - Error message
     */
    static unauthorized(res, message = 'Unauthorized access') {
        const response = {
            success: false,
            message,
            timestamp: new Date().toISOString()
        };

        logger.security('Unauthorized access attempt', { message });
        return res.status(401).json(response);
    }

    /**
     * Send forbidden response
     * @param {Object} res - Express response object
     * @param {string} message - Error message
     */
    static forbidden(res, message = 'Access forbidden') {
        const response = {
            success: false,
            message,
            timestamp: new Date().toISOString()
        };

        logger.security('Forbidden access attempt', { message });
        return res.status(403).json(response);
    }

    /**
     * Send not found response
     * @param {Object} res - Express response object
     * @param {string} message - Error message
     */
    static notFound(res, message = 'Resource not found') {
        const response = {
            success: false,
            message,
            timestamp: new Date().toISOString()
        };

        logger.debug('Not found response sent', { message });
        return res.status(404).json(response);
    }

    /**
     * Send conflict response
     * @param {Object} res - Express response object
     * @param {string} message - Error message
     */
    static conflict(res, message = 'Resource conflict') {
        const response = {
            success: false,
            message,
            timestamp: new Date().toISOString()
        };

        logger.warn('Conflict response sent', { message });
        return res.status(409).json(response);
    }

    /**
     * Send rate limit response
     * @param {Object} res - Express response object
     * @param {string} message - Error message
     */
    static rateLimited(res, message = 'Too many requests') {
        const response = {
            success: false,
            message,
            timestamp: new Date().toISOString()
        };

        logger.warn('Rate limit response sent', { message });
        return res.status(429).json(response);
    }

    /**
     * Send paginated response
     * @param {Object} res - Express response object
     * @param {Array} data - Response data
     * @param {Object} pagination - Pagination info
     * @param {string} message - Success message
     */
    static paginated(res, data, pagination, message = 'Success') {
        const response = {
            success: true,
            message,
            data,
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                total: pagination.total,
                pages: Math.ceil(pagination.total / pagination.limit),
                hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
                hasPrev: pagination.page > 1
            },
            timestamp: new Date().toISOString()
        };

        logger.debug('Paginated response sent', { 
            message, 
            itemCount: data.length, 
            pagination: response.pagination 
        });
        return res.status(200).json(response);
    }
}

export default ResponseUtil;
