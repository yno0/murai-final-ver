import mongoose from "mongoose";

const dictionarySchema = new mongoose.Schema({
    word: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        index: true
    },
    language: {
        type: String,
        enum: ["Filipino", "English"],
        required: true,
        index: true
    },
    variations: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    category: {
        type: String,
        enum: ["profanity", "slur", "bullying", "sexual", "other"],
        required: true,
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    // Additional metadata for better management (severity removed)
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    // For tracking usage and effectiveness
    detectionCount: {
        type: Number,
        default: 0
    },
    lastDetected: {
        type: Date,
        default: null
    },
    // Source information
    source: {
        type: String,
        enum: ['system', 'user', 'ai', 'community'],
        default: 'system'
    }
}, {
    timestamps: true
});

// Compound indexes for better query performance
dictionarySchema.index({ word: 1, language: 1 }, { unique: true }); // Prevent duplicates
dictionarySchema.index({ language: 1, category: 1 }); // For filtered queries
dictionarySchema.index({ isActive: 1, language: 1 }); // For active words by language
dictionarySchema.index({ detectionCount: -1 }); // For most detected words

// Static method to add a new word
dictionarySchema.statics.addWord = async function(wordData) {
    const { word, language, variations = [], category, addedBy, source = 'system' } = wordData;

    // Check if word already exists
    const existingWord = await this.findOne({ 
        word: word.toLowerCase().trim(), 
        language 
    });

    if (existingWord) {
        // Update variations if new ones are provided
        const newVariations = variations.filter(v => 
            !existingWord.variations.includes(v.toLowerCase().trim())
        );
        
        if (newVariations.length > 0) {
            existingWord.variations.push(...newVariations.map(v => v.toLowerCase().trim()));
            await existingWord.save();
        }
        
        return existingWord;
    }

    // Create new word entry
    const newWord = new this({
        word: word.toLowerCase().trim(),
        language,
        variations: variations.map(v => v.toLowerCase().trim()),
        category,
        addedBy,
        source
    });

    return await newWord.save();
};

// Static method to get dictionary by language
dictionarySchema.statics.getDictionary = async function(language, options = {}) {
    const {
        category,
        includeInactive = false,
        page = 1,
        limit = 1000
    } = options;

    const query = { language };
    
    if (!includeInactive) query.isActive = true;
    if (category) query.category = category;

    const skip = (page - 1) * limit;

    const [words, total] = await Promise.all([
        this.find(query)
            .select('word variations category detectionCount')
            .sort({ word: 1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        this.countDocuments(query)
    ]);

    return {
        words,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

// Static method to search for words (including variations)
dictionarySchema.statics.searchWords = async function(searchTerm, language) {
    const regex = new RegExp(searchTerm.toLowerCase().trim(), 'i');
    
    const words = await this.find({
        language,
        isActive: true,
        $or: [
            { word: regex },
            { variations: { $in: [regex] } }
        ]
    }).select('word variations category').lean();

    return words;
};

// Static method to get words for detection (optimized for extension)
dictionarySchema.statics.getDetectionWords = async function(language) {
    const words = await this.find({
        language,
        isActive: true
    }).select('word variations category').lean();

    // Create a flat array of all words and variations for fast lookup
    const wordList = [];
    words.forEach(entry => {
        wordList.push({
            word: entry.word,
            category: entry.category,
            isVariation: false
        });
        
        entry.variations.forEach(variation => {
            wordList.push({
                word: variation,
                category: entry.category,
                isVariation: true,
                originalWord: entry.word
            });
        });
    });

    return wordList;
};

// Static method to increment detection count
dictionarySchema.statics.recordDetection = async function(word, language) {
    await this.findOneAndUpdate(
        { word: word.toLowerCase().trim(), language },
        { 
            $inc: { detectionCount: 1 },
            $set: { lastDetected: new Date() }
        }
    );
};

// Static method to get statistics
dictionarySchema.statics.getStats = async function() {
    const stats = await this.aggregate([
        {
            $group: {
                _id: {
                    language: '$language',
                    category: '$category'
                },
                count: { $sum: 1 },
                totalDetections: { $sum: '$detectionCount' }
            }
        },
        {
            $group: {
                _id: '$_id.language',
                categories: {
                    $push: {
                        category: '$_id.category',
                        count: '$count',
                        totalDetections: '$totalDetections'
                    }
                },
                totalWords: { $sum: '$count' },
                totalDetections: { $sum: '$totalDetections' }
            }
        }
    ]);

    return stats;
};

// Instance method to deactivate word
dictionarySchema.methods.deactivate = function() {
    this.isActive = false;
    return this.save();
};

// Instance method to activate word
dictionarySchema.methods.activate = function() {
    this.isActive = true;
    return this.save();
};

export default mongoose.model("Dictionary", dictionarySchema);
