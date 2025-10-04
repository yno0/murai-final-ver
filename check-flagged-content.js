import mongoose from 'mongoose';
import FlaggedContent from './server/models/flaggedContentModel.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/murai');

mongoose.connection.on('connected', async () => {
    console.log('✅ Connected to MongoDB');
    
    try {
        // Check flagged content count
        const count = await FlaggedContent.countDocuments();
        console.log(`📊 Total flagged content entries: ${count}`);
        
        // Get recent entries
        const recent = await FlaggedContent.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();
        
        console.log('\n📋 Recent flagged content:');
        recent.forEach((item, index) => {
            console.log(`${index + 1}. ${item.detectedWord} - ${item.context.substring(0, 50)}... (${item.language})`);
        });
        
        // Check by user
        const userCounts = await FlaggedContent.aggregate([
            { $group: { _id: '$userId', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        console.log('\n👥 Flagged content by user:');
        userCounts.forEach((user, index) => {
            console.log(`${index + 1}. User ${user._id}: ${user.count} entries`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        mongoose.connection.close();
    }
});

mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
});
