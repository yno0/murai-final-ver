import express from 'express';
import mongoose from 'mongoose';
import { authenticateAdmin } from '../middleware/adminAuth.js';
import Dictionary from '../models/dictionaryModel.js';
import ResponseUtil from '../utils/response.js';
import logger from '../utils/logger.js';
import Log from '../models/logModel.js';

const router = express.Router();

router.use(authenticateAdmin);

/**
 * GET /api/admin/dictionary/words
 * Query: page, limit, language, category, search
 */
router.get('/words', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 100, 1), 1000);
    const { language, category, search } = req.query;

    const filter = {};
    if (language) filter.language = language;
    if (category) filter.category = category;
    if (search) filter.word = { $regex: search, $options: 'i' };

    const [words, total] = await Promise.all([
      Dictionary.find(filter).select('word language category variations').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Dictionary.countDocuments(filter)
    ]);

    ResponseUtil.success(res, { words, pagination: { page, limit, total } }, 'Dictionary words retrieved');
  } catch (error) {
    logger.error('Admin dictionary fetch failed', error);
    ResponseUtil.error(res, 'Failed to retrieve dictionary words', 500, error);
  }
});

/**
 * POST /api/admin/dictionary/words
 * Body: { word, language, category, variations? }
 */
router.post('/words', async (req, res) => {
  try {
    const { word, language, category, variations = [] } = req.body || {};

    if (!word || !language || !category) {
      return ResponseUtil.badRequest(res, 'word, language, and category are required');
    }

    const created = await Dictionary.addWord({
      word,
      language,
      category,
      variations,
      addedBy: req.admin?.adminId,
      source: 'system'
    });

    // Log admin dictionary creation
    try {
      await Log.createLog({
        action: 'admin_dictionary_update',
        details: `Admin added word "${created.word}" (${created.language})`,
        userId: req.admin?.adminId,
        metadata: {
          actorRole: 'admin',
          actorName: req.admin?.name,
          actorEmail: req.admin?.email,
          wordId: created._id,
          word: created.word,
          language: created.language,
          category: created.category
        },
        isSystemLog: false
      });
    } catch (e) {
      logger.warn('Failed to record admin dictionary create log', e);
    }

    ResponseUtil.success(res, created, 'Word created', 201);
  } catch (error) {
    logger.error('Admin dictionary create failed', error);
    ResponseUtil.error(res, 'Failed to create word', 500, error);
  }
});

/**
 * PUT /api/admin/dictionary/words/:id
 * Body: { word?, language?, category?, variations? }
 */
router.put('/words/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { word, language, category, variations } = req.body || {};

    const update = {};
    if (typeof word === 'string') update.word = word.toLowerCase().trim();
    if (typeof language === 'string') update.language = language;
    if (typeof category === 'string') update.category = category;
    if (Array.isArray(variations)) update.variations = variations.map(v => String(v).toLowerCase().trim());

    const updated = await Dictionary.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!updated) return ResponseUtil.notFound(res, 'Word not found');

    // Log admin dictionary update
    try {
      await Log.createLog({
        action: 'admin_dictionary_update',
        details: `Admin updated word "${updated.word}" (${updated.language})`,
        userId: req.admin?.adminId,
        metadata: {
          actorRole: 'admin',
          actorName: req.admin?.name,
          actorEmail: req.admin?.email,
          wordId: updated._id,
          word: updated.word,
          language: updated.language,
          category: updated.category
        },
        isSystemLog: false
      });
    } catch (e) {
      logger.warn('Failed to record admin dictionary update log', e);
    }

    ResponseUtil.success(res, updated, 'Word updated');
  } catch (error) {
    logger.error('Admin dictionary update failed', error);
    ResponseUtil.error(res, 'Failed to update word', 500, error);
  }
});

/**
 * DELETE /api/admin/dictionary/words/:id
 */
router.delete('/words/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Dictionary.findByIdAndDelete(id).lean();
    if (!deleted) return ResponseUtil.notFound(res, 'Word not found');

    // Log admin dictionary delete
    try {
      await Log.createLog({
        action: 'admin_dictionary_update',
        details: `Admin deleted word "${deleted.word}" (${deleted.language})`,
        userId: req.admin?.adminId,
        metadata: {
          actorRole: 'admin',
          actorName: req.admin?.name,
          actorEmail: req.admin?.email,
          wordId: deleted._id,
          word: deleted.word,
          language: deleted.language,
          category: deleted.category
        },
        isSystemLog: false
      });
    } catch (e) {
      logger.warn('Failed to record admin dictionary delete log', e);
    }

    ResponseUtil.success(res, null, 'Word deleted');
  } catch (error) {
    logger.error('Admin dictionary delete failed', error);
    ResponseUtil.error(res, 'Failed to delete word', 500, error);
  }
});

/**
 * POST /api/admin/dictionary/export
 * Export dictionary words as JSON
 */
router.post('/export', async (req, res) => {
  try {
    const { language, category, format = 'json' } = req.body;

    const filter = {};
    if (language) filter.language = language;
    if (category) filter.category = category;

    const words = await Dictionary.find(filter)
      .select('word language category variations isActive createdAt')
      .sort({ word: 1 })
      .lean();

    const exportData = {
      exportedAt: new Date().toISOString(),
      exportedBy: req.admin?.email || 'admin',
      totalCount: words.length,
      filters: { language, category },
      words: words.map(w => ({
        word: w.word,
        language: w.language,
        category: w.category,
        variations: w.variations || [],
        isActive: w.isActive,
        createdAt: w.createdAt
      }))
    };

    // Log export action
    try {
      await Log.createLog({
        action: 'admin_dictionary_export',
        details: `Admin exported ${words.length} words`,
        userId: req.admin?.adminId,
        metadata: {
          actorRole: 'admin',
          actorName: req.admin?.name,
          actorEmail: req.admin?.email,
          exportCount: words.length,
          filters: { language, category }
        },
        isSystemLog: false
      });
    } catch (e) {
      logger.warn('Failed to record export log', e);
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="dictionary-export-${new Date().toISOString().slice(0,10)}.json"`);
    ResponseUtil.success(res, exportData, 'Dictionary exported successfully');
  } catch (error) {
    logger.error('Dictionary export failed', error);
    ResponseUtil.error(res, 'Failed to export dictionary', 500, error);
  }
});

/**
 * POST /api/admin/dictionary/import
 * Import dictionary words from JSON
 */
router.post('/import', async (req, res) => {
  try {
    const { words, options = {} } = req.body;

    if (!Array.isArray(words) || words.length === 0) {
      return ResponseUtil.badRequest(res, 'Words array is required and must not be empty');
    }

    // Check database connection
    console.log('Database connection state:', mongoose.connection.readyState);
    if (mongoose.connection.readyState !== 1) {
      console.warn('Database not connected, but continuing for testing...');
      // For now, let's continue without database for testing
      return ResponseUtil.success(res, {
        total: words.length,
        imported: 0,
        updated: 0,
        skipped: words.length,
        errors: ['Database not connected - this is a test response']
      }, 'Import test completed (no database)');
    }

    const results = {
      total: words.length,
      imported: 0,
      updated: 0,
      skipped: 0,
      errors: []
    };

    // Simple validation and preparation
    const newWords = [];
    const validCategories = ['profanity', 'slur', 'bullying', 'sexual', 'other'];
    const validLanguages = ['Filipino', 'English'];

    for (let i = 0; i < words.length; i++) {
      const wordData = words[i];

      // Basic validation
      if (!wordData.word || !wordData.language || !wordData.category) {
        results.skipped++;
        continue;
      }

      // Normalize and validate
      const word = wordData.word.toLowerCase().trim();
      const language = validLanguages.includes(wordData.language) ? wordData.language : 'English';
      const category = validCategories.includes(wordData.category) ? wordData.category : 'other';

      if (word) {
        newWords.push({
          word,
          language,
          category,
          variations: [],
          addedBy: req.admin?.adminId,
          source: 'system',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          detectionCount: 0,
          lastDetected: null
        });
        // Don't count as imported yet - wait for actual database result
      } else {
        results.skipped++;
      }
    }

    // Fast bulk insert with duplicate key handling
    if (newWords.length > 0) {
      try {
        console.log(`Attempting to insert ${newWords.length} words into database...`);
        console.log('Sample word:', newWords[0]);

        const insertResult = await Dictionary.insertMany(newWords, {
          ordered: false,
          rawResult: true
        });

        console.log('Insert result:', insertResult);

        // Check for validation errors
        if (insertResult.mongoose && insertResult.mongoose.validationErrors && insertResult.mongoose.validationErrors.length > 0) {
          console.log('Validation errors found:');
          console.log('First 3 validation errors:', insertResult.mongoose.validationErrors.slice(0, 3));

          // Log specific error details
          insertResult.mongoose.validationErrors.slice(0, 3).forEach((error, index) => {
            console.log(`Error ${index + 1}:`, error.message);
            if (error.errors) {
              Object.keys(error.errors).forEach(field => {
                console.log(`  Field '${field}': ${error.errors[field].message}`);
              });
            }
          });
        }

        console.log(`Successfully inserted ${insertResult.insertedCount || 0} words out of ${newWords.length} attempted`);

        // Update results based on actual database results
        const actualInserted = insertResult.insertedCount || 0;
        const validationErrors = insertResult.mongoose?.validationErrors?.length || 0;

        results.imported = actualInserted;
        results.skipped += validationErrors;

        if (validationErrors > 0) {
          results.errors.push(`${validationErrors} words failed validation`);
        }

      } catch (error) {
        console.error('Insert error:', error);

        // Handle duplicate key errors
        if (error.code === 11000) {
          // Some duplicates were skipped, that's fine
          const duplicateCount = error.writeErrors ? error.writeErrors.length : 0;
          const successfulInserts = newWords.length - duplicateCount;

          console.log(`Bulk insert completed with ${duplicateCount} duplicates, ${successfulInserts} successful`);

          results.skipped += duplicateCount;
          results.imported = successfulInserts;
        } else {
          throw error;
        }
      }
    } else {
      console.log('No new words to insert');
    }

    // Log import action
    try {
      await Log.createLog({
        action: 'admin_dictionary_import',
        details: `Admin imported ${results.imported} words, updated ${results.updated}, skipped ${results.skipped}`,
        userId: req.admin?.adminId,
        metadata: {
          actorRole: 'admin',
          actorName: req.admin?.name,
          actorEmail: req.admin?.email,
          importResults: results
        },
        isSystemLog: false
      });
    } catch (e) {
      logger.warn('Failed to record import log', e);
    }

    ResponseUtil.success(res, results, 'Import completed');
  } catch (error) {
    logger.error('Dictionary import failed', error);
    ResponseUtil.error(res, 'Failed to import dictionary', 500, error);
  }
});

export default router;
