import dotenv from "dotenv";
import mongoose from "mongoose";
import Admin from "../models/adminModel.js";

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

// Create admin user
const createAdminUser = async () => {
    try {
        // Check if admin already exists
        const existingAdmin = await Admin.findByEmail('murai@admin.com');
        
        if (existingAdmin) {
            console.log("⚠️  Admin user already exists with email: murai@admin.com");
            
            // Update password if needed
            existingAdmin.password = 'muraitestadmin123';
            await existingAdmin.save();
            console.log("✅ Admin password updated successfully");
            
            return existingAdmin;
        }

        // Create new admin user
        const adminData = {
            name: 'MURAi Administrator',
            email: 'murai@admin.com',
            password: 'muraitestadmin123',
            role: 'super_admin',
            status: 'active',
            permissions: [
                'view_dashboard',
                'manage_dictionary',
                'view_analytics',
                'manage_moderation',
                'view_users',
                'manage_users',
                'manage_settings',
                'manage_admins',
                'view_logs',
                'manage_integrations',
                'manage_reports',
                'manage_support'
            ],
            department: 'System Administration'
        };

        const admin = await Admin.createAdmin(adminData);
        
        console.log("✅ Admin user created successfully!");
        console.log("📧 Email:", admin.email);
        console.log("🔑 Password: muraitestadmin123");
        console.log("👤 Role:", admin.role);
        console.log("🆔 Admin ID:", admin._id);
        
        return admin;

    } catch (error) {
        console.error("❌ Error creating admin user:", error);
        throw error;
    }
};

// Main function
const main = async () => {
    try {
        console.log("🚀 Starting admin user creation...");
        
        await connectDB();
        await createAdminUser();
        
        console.log("✅ Admin setup completed successfully!");
        
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
