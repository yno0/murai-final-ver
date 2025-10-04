import Dictionary from '../models/dictionaryModel.js';
import Log from '../models/logModel.js';
import ResponseUtil from '../utils/response.js';
import logger from '../utils/logger.js';

/**
 * Dictionary Controller
 * Handles bad words dictionary management
 */
class DictionaryController {
    /**
     * Add a new word to the dictionary
     * POST /api/dictionary
     */
    async addWord(req, res) {
        try {
            const userId = req.user.userId;
            const { word, language, variations = [], category } = req.body;

            // Validate required fields
            if (!word || !language || !category) {
                return ResponseUtil.validationError(res, 'Missing required fields: word, language, category');
            }

            // Validate enum values
            if (!['Filipino', 'English'].includes(language)) {
                return ResponseUtil.validationError(res, 'Language must be Filipino or English');
            }

            if (!['profanity', 'slur', 'bullying', 'sexual', 'other'].includes(category)) {
                return ResponseUtil.validationError(res, 'Invalid category');
            }

            // Add word to dictionary
            const dictionaryEntry = await Dictionary.addWord({
                word,
                language,
                variations,
                category,
                addedBy: userId,
                source: 'user'
            });

            // Log the dictionary update
            await Log.createLog({
                action: 'dictionary_updated',
                details: `Added word "${word}" to ${language} dictionary`,
                userId,
                metadata: {
                    word,
                    language,
                    category,
                    variationsCount: variations.length,
                    ip: req.ip
                }
            });

            logger.info('Word added to dictionary', {
                word,
                language,
                category,
                userId
            });

            ResponseUtil.success(res, dictionaryEntry, 'Word added to dictionary successfully', 201);

        } catch (error) {
            logger.error('Error adding word to dictionary', error, {
                userId: req.user?.userId,
                body: req.body
            });

            if (error.name === 'ValidationError') {
                return ResponseUtil.validationError(res, `Validation error: ${error.message}`);
            }

            ResponseUtil.error(res, 'Failed to add word to dictionary', 500, error);
        }
    }

    /**
     * Get dictionary words
     * GET /api/dictionary?language=English&category=profanity
     */
    async getDictionary(req, res) {
        try {
            const { language, category, page = 1, limit = 100 } = req.query;

            if (!language) {
                return ResponseUtil.validationError(res, 'Language parameter is required');
            }

            if (!['Filipino', 'English'].includes(language)) {
                return ResponseUtil.validationError(res, 'Language must be Filipino or English');
            }

            const result = await Dictionary.getDictionary(language, {
                category,
                page: parseInt(page),
                limit: Math.min(parseInt(limit), 1000)
            });

            ResponseUtil.success(res, result, 'Dictionary retrieved successfully');

        } catch (error) {
            logger.error('Error retrieving dictionary', error, {
                userId: req.user?.userId,
                query: req.query
            });

            ResponseUtil.error(res, 'Failed to retrieve dictionary', 500, error);
        }
    }

    /**
     * Search dictionary words
     * GET /api/dictionary/search?term=bad&language=English
     */
    async searchWords(req, res) {
        try {
            const { term, language } = req.query;

            if (!term || !language) {
                return ResponseUtil.validationError(res, 'Both term and language parameters are required');
            }

            if (!['Filipino', 'English'].includes(language)) {
                return ResponseUtil.validationError(res, 'Language must be Filipino or English');
            }

            const words = await Dictionary.searchWords(term, language);

            ResponseUtil.success(res, { words }, 'Search completed successfully');

        } catch (error) {
            logger.error('Error searching dictionary', error, {
                userId: req.user?.userId,
                query: req.query
            });

            ResponseUtil.error(res, 'Failed to search dictionary', 500, error);
        }
    }

    /**
     * Get words for detection (optimized for extension)
     * GET /api/dictionary/detection?language=English
     */
    async getDetectionWords(req, res) {
        try {
            const { language } = req.query;

            if (!language) {
                return ResponseUtil.validationError(res, 'Language parameter is required');
            }

            if (!['Filipino', 'English'].includes(language)) {
                return ResponseUtil.validationError(res, 'Language must be Filipino or English');
            }

            const words = await Dictionary.getDetectionWords(language);

            ResponseUtil.success(res, { words }, 'Detection words retrieved successfully');

        } catch (error) {
            logger.error('Error retrieving detection words', error, {
                userId: req.user?.userId,
                query: req.query
            });

            ResponseUtil.error(res, 'Failed to retrieve detection words', 500, error);
        }
    }

    /**
     * Get words for extension use (public endpoint, no authentication required)
     * GET /api/dictionary/extension/words?language=English
     */
    async getExtensionWords(req, res) {
        try {
            const { language } = req.query;

            if (!language) {
                return ResponseUtil.validationError(res, 'Language parameter is required');
            }

            if (!['Filipino', 'English'].includes(language)) {
                return ResponseUtil.validationError(res, 'Language must be Filipino or English');
            }

            // Get words optimized for extension detection
            const words = await Dictionary.getDetectionWords(language);

            // Add cache headers for better performance
            res.set({
                'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
                'ETag': `"${language}-${Date.now()}"`,
                'Last-Modified': new Date().toUTCString()
            });

            ResponseUtil.success(res, {
                words,
                language,
                count: words.length,
                timestamp: new Date().toISOString()
            }, 'Extension dictionary words retrieved successfully');

        } catch (error) {
            logger.error('Error retrieving extension dictionary words', error, {
                query: req.query,
                ip: req.ip
            });

            ResponseUtil.error(res, 'Failed to retrieve extension dictionary words', 500, error);
        }
    }

    /**
     * Get dictionary statistics
     * GET /api/dictionary/stats
     */
    async getStats(req, res) {
        try {
            const stats = await Dictionary.getStats();

            ResponseUtil.success(res, { stats }, 'Dictionary statistics retrieved successfully');

        } catch (error) {
            logger.error('Error retrieving dictionary statistics', error, {
                userId: req.user?.userId
            });

            ResponseUtil.error(res, 'Failed to retrieve dictionary statistics', 500, error);
        }
    }

    /**
     * Update word status (activate/deactivate)
     * PATCH /api/dictionary/:id/status
     */
    async updateWordStatus(req, res) {
        try {
            const userId = req.user.userId;
            const wordId = req.params.id;
            const { isActive } = req.body;

            if (typeof isActive !== 'boolean') {
                return ResponseUtil.validationError(res, 'isActive must be a boolean value');
            }

            const word = await Dictionary.findById(wordId);

            if (!word) {
                return ResponseUtil.notFound(res, 'Word not found');
            }

            // Update status
            if (isActive) {
                await word.activate();
            } else {
                await word.deactivate();
            }

            // Log the status change
            await Log.createLog({
                action: 'dictionary_updated',
                details: `Word "${word.word}" ${isActive ? 'activated' : 'deactivated'}`,
                userId,
                metadata: {
                    wordId,
                    word: word.word,
                    language: word.language,
                    newStatus: isActive ? 'active' : 'inactive',
                    ip: req.ip
                }
            });

            logger.info('Word status updated', {
                wordId,
                word: word.word,
                isActive,
                userId
            });

            ResponseUtil.success(res, word, `Word ${isActive ? 'activated' : 'deactivated'} successfully`);

        } catch (error) {
            logger.error('Error updating word status', error, {
                userId: req.user?.userId,
                wordId: req.params.id,
                body: req.body
            });

            ResponseUtil.error(res, 'Failed to update word status', 500, error);
        }
    }

    /**
     * Delete a word from dictionary
     * DELETE /api/dictionary/:id
     */
    async deleteWord(req, res) {
        try {
            const userId = req.user.userId;
            const wordId = req.params.id;

            const word = await Dictionary.findByIdAndDelete(wordId);

            if (!word) {
                return ResponseUtil.notFound(res, 'Word not found');
            }

            // Log the deletion
            await Log.createLog({
                action: 'dictionary_updated',
                details: `Word "${word.word}" deleted from dictionary`,
                userId,
                metadata: {
                    wordId,
                    word: word.word,
                    language: word.language,
                    category: word.category,
                    ip: req.ip
                }
            });

            logger.info('Word deleted from dictionary', {
                wordId,
                word: word.word,
                userId
            });

            ResponseUtil.success(res, null, 'Word deleted successfully');

        } catch (error) {
            logger.error('Error deleting word', error, {
                userId: req.user?.userId,
                wordId: req.params.id
            });

            ResponseUtil.error(res, 'Failed to delete word', 500, error);
        }
    }

    /**
     * Bulk update word variations
     * PUT /api/dictionary/:id/variations
     */
    async updateWordVariations(req, res) {
        try {
            const userId = req.user.userId;
            const wordId = req.params.id;
            const { variations } = req.body;

            if (!Array.isArray(variations)) {
                return ResponseUtil.validationError(res, 'Variations must be an array');
            }

            const word = await Dictionary.findById(wordId);

            if (!word) {
                return ResponseUtil.notFound(res, 'Word not found');
            }

            // Update variations
            word.variations = variations.map(v => v.toLowerCase().trim()).filter(Boolean);
            await word.save();

            // Log the update
            await Log.createLog({
                action: 'dictionary_updated',
                details: `Updated variations for word "${word.word}"`,
                userId,
                metadata: {
                    wordId,
                    word: word.word,
                    language: word.language,
                    variationsCount: word.variations.length,
                    ip: req.ip
                }
            });

            logger.info('Word variations updated', {
                wordId,
                word: word.word,
                variationsCount: word.variations.length,
                userId
            });

            ResponseUtil.success(res, word, 'Word variations updated successfully');

        } catch (error) {
            logger.error('Error updating word variations', error, {
                userId: req.user?.userId,
                wordId: req.params.id,
                body: req.body
            });

            ResponseUtil.error(res, 'Failed to update word variations', 500, error);
        }
    }

    /**
     * Get words with variations (for synonym management)
     * GET /api/dictionary/with-variations
     */
    async getWordsWithVariations(req, res) {
        try {
            const { language, category, page = 1, limit = 100 } = req.query;

            const query = {
                variations: { $exists: true, $not: { $size: 0 } }
            };

            if (language) {
                if (!['Filipino', 'English'].includes(language)) {
                    return ResponseUtil.validationError(res, 'Language must be Filipino or English');
                }
                query.language = language;
            }

            if (category) {
                if (!['profanity', 'slur', 'bullying', 'sexual', 'other'].includes(category)) {
                    return ResponseUtil.validationError(res, 'Invalid category');
                }
                query.category = category;
            }

            const skip = (parseInt(page) - 1) * parseInt(limit);

            const [words, total] = await Promise.all([
                Dictionary.find(query)
                    .select('word language category variations isActive createdAt')
                    .sort({ word: 1 })
                    .skip(skip)
                    .limit(parseInt(limit))
                    .lean(),
                Dictionary.countDocuments(query)
            ]);

            ResponseUtil.success(res, {
                words,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / parseInt(limit))
                }
            }, 'Words with variations retrieved successfully');

        } catch (error) {
            logger.error('Error retrieving words with variations', error, {
                userId: req.user?.userId,
                query: req.query
            });

            ResponseUtil.error(res, 'Failed to retrieve words with variations', 500, error);
        }
    }
}

export default new DictionaryController();
