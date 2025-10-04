import dotenv from "dotenv";
import mongoose from "mongoose";
import FlaggedContent from "./server/models/flaggedContentModel.js";
import User from "./server/models/userModel.js";

// Load environment variables
dotenv.config({ path: '.env' });

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/murai");
        console.log("✅ Connected to MongoDB");
    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
        process.exit(1);
    }
};

// Create test flagged content
const createTestFlaggedContent = async () => {
    try {
        // Find or create a test user
        let testUser = await User.findOne({ email: 'test@example.com' });
        
        if (!testUser) {
            testUser = new User({
                name: 'Test User',
                email: 'test@example.com',
                password: 'testpassword123',
                isVerified: true
            });
            await testUser.save();
            console.log("✅ Test user created");
        }

        // Create sample flagged content entries
        const testEntries = [
            {
                userId: testUser._id,
                language: 'English',
                detectedWord: 'badword1',
                context: 'This is a test context containing badword1 that should be flagged',
                sentiment: 'negative',
                confidenceScore: 0.85,
                sourceUrl: 'https://example.com/page1',
                metadata: {
                    detectionMethod: 'hybrid',
                    aiModel: 'roberta-v1',
                    processingTime: 150,
                    extensionVersion: '1.0.0',
                    severity: 'high'
                }
            },
            {
                userId: testUser._id,
                language: 'Filipino',
                detectedWord: 'badword2',
                context: 'Ito ay isang test context na naglalaman ng badword2 na dapat ma-flag',
                sentiment: 'negative',
                confidenceScore: 0.72,
                sourceUrl: 'https://example.com/page2',
                metadata: {
                    detectionMethod: 'context-aware',
                    aiModel: 'roberta-v1',
                    processingTime: 200,
                    extensionVersion: '1.0.0',
                    severity: 'medium'
                }
            },
            {
                userId: testUser._id,
                language: 'Mixed',
                detectedWord: 'badword3',
                context: 'This is mixed content with badword3 na dapat ma-detect',
                sentiment: 'negative',
                confidenceScore: 0.65,
                sourceUrl: 'https://facebook.com/post123',
                metadata: {
                    detectionMethod: 'term-based',
                    aiModel: 'roberta-v1',
                    processingTime: 100,
                    extensionVersion: '1.0.0',
                    severity: 'medium'
                }
            },
            {
                userId: testUser._id,
                language: 'English',
                detectedWord: 'offensive',
                context: 'Another test with offensive content that needs moderation',
                sentiment: 'negative',
                confidenceScore: 0.91,
                sourceUrl: 'https://twitter.com/status/123',
                metadata: {
                    detectionMethod: 'hybrid',
                    aiModel: 'roberta-v1',
                    processingTime: 180,
                    extensionVersion: '1.0.0',
                    severity: 'high'
                }
            },
            {
                userId: testUser._id,
                language: 'Filipino',
                detectedWord: 'masama',
                context: 'Ito ay masama na salita na dapat bantayan ng sistema',
                sentiment: 'negative',
                confidenceScore: 0.78,
                sourceUrl: 'https://reddit.com/r/test/comments/123',
                metadata: {
                    detectionMethod: 'context-aware',
                    aiModel: 'roberta-v1',
                    processingTime: 220,
                    extensionVersion: '1.0.0',
                    severity: 'medium'
                }
            }
        ];

        // Clear existing test data
        await FlaggedContent.deleteMany({ 'metadata.extensionVersion': '1.0.0' });
        console.log("🧹 Cleared existing test data");

        // Insert test entries
        const created = await FlaggedContent.insertMany(testEntries);
        console.log(`✅ Created ${created.length} test flagged content entries`);

        // Display summary
        const total = await FlaggedContent.countDocuments();
        console.log(`📊 Total flagged content entries in database: ${total}`);

        // Show breakdown by language
        const breakdown = await FlaggedContent.aggregate([
            { $group: { _id: '$language', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        console.log('\n📋 Breakdown by language:');
        breakdown.forEach(item => {
            console.log(`  ${item._id}: ${item.count} entries`);
        });

        return created;

    } catch (error) {
        console.error("❌ Error creating test flagged content:", error);
        throw error;
    }
};

// Main function
const main = async () => {
    try {
        console.log("🚀 Creating test flagged content...");
        
        await connectDB();
        await createTestFlaggedContent();
        
        console.log("✅ Test data creation completed successfully!");
        console.log("🌐 You can now view the flagged content at: http://localhost:5173/admin/moderation/flagged-content");
        
    } catch (error) {
        console.error("❌ Setup failed:", error);
    } finally {
        // Close database connection
        await mongoose.connection.close();
        console.log("🔌 Database connection closed");
        process.exit(0);
    }
};

// Run the script
main();
