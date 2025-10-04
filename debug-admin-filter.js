// Debug script to check admin filter issues
import dotenv from "dotenv";
import mongoose from "mongoose";
import FlaggedContent from "./server/models/flaggedContentModel.js";

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

// Debug flagged content filtering
const debugFiltering = async () => {
    try {
        console.log("🔍 Debugging flagged content filtering...\n");

        // 1. Check total count without any filters
        const totalCount = await FlaggedContent.countDocuments();
        console.log(`📊 Total flagged content entries: ${totalCount}`);

        // 2. Check count with isActive: true filter (what admin API uses)
        const activeCount = await FlaggedContent.countDocuments({ isActive: true });
        console.log(`📊 Active flagged content entries: ${activeCount}`);

        // 3. Check count with isActive: false
        const inactiveCount = await FlaggedContent.countDocuments({ isActive: false });
        console.log(`📊 Inactive flagged content entries: ${inactiveCount}`);

        // 4. Check entries without isActive field
        const noActiveFieldCount = await FlaggedContent.countDocuments({ isActive: { $exists: false } });
        console.log(`📊 Entries without isActive field: ${noActiveFieldCount}`);

        // 5. Sample some entries to see their structure
        console.log("\n📋 Sample entries:");
        const sampleEntries = await FlaggedContent.find({}).limit(3).lean();
        sampleEntries.forEach((entry, index) => {
            console.log(`\n${index + 1}. Entry ID: ${entry._id}`);
            console.log(`   detectedWord: ${entry.detectedWord}`);
            console.log(`   language: ${entry.language}`);
            console.log(`   status: ${entry.status}`);
            console.log(`   isActive: ${entry.isActive}`);
            console.log(`   metadata.severity: ${entry.metadata?.severity}`);
            console.log(`   createdAt: ${entry.createdAt}`);
        });

        // 6. Test the exact filter used by admin API
        console.log("\n🔍 Testing admin API filter...");
        const adminFilter = { isActive: true };
        const adminResults = await FlaggedContent.find(adminFilter).limit(5).lean();
        console.log(`Admin filter results: ${adminResults.length} entries`);

        // 7. If no active entries, let's update some to be active
        if (activeCount === 0 && totalCount > 0) {
            console.log("\n🔧 No active entries found. Updating entries to be active...");
            const updateResult = await FlaggedContent.updateMany(
                { isActive: { $ne: true } },
                { $set: { isActive: true } }
            );
            console.log(`✅ Updated ${updateResult.modifiedCount} entries to be active`);

            // Check again
            const newActiveCount = await FlaggedContent.countDocuments({ isActive: true });
            console.log(`📊 New active count: ${newActiveCount}`);
        }

        // 8. Test different status values
        console.log("\n📊 Status breakdown:");
        const statusBreakdown = await FlaggedContent.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        statusBreakdown.forEach(item => {
            console.log(`   ${item._id || 'null'}: ${item.count} entries`);
        });

        // 9. Test different language values
        console.log("\n🌐 Language breakdown:");
        const languageBreakdown = await FlaggedContent.aggregate([
            { $group: { _id: '$language', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        languageBreakdown.forEach(item => {
            console.log(`   ${item._id || 'null'}: ${item.count} entries`);
        });

        // 10. Test different severity values
        console.log("\n⚠️ Severity breakdown:");
        const severityBreakdown = await FlaggedContent.aggregate([
            { $group: { _id: '$metadata.severity', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        severityBreakdown.forEach(item => {
            console.log(`   ${item._id || 'null'}: ${item.count} entries`);
        });

    } catch (error) {
        console.error("❌ Error debugging:", error);
        throw error;
    }
};

// Main function
const main = async () => {
    try {
        await connectDB();
        await debugFiltering();
        
        console.log("\n✅ Debug completed!");
        
    } catch (error) {
        console.error("❌ Debug failed:", error);
    } finally {
        // Close database connection
        await mongoose.connection.close();
        console.log("🔌 Database connection closed");
        process.exit(0);
    }
};

// Run the script
main();
