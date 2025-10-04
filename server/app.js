import dotenv from "dotenv";

// Load environment variables FIRST before any other imports
dotenv.config({ path: '.env' });

import mongoose from "mongoose";

// Import app configuration
import { createApp } from './config/app.js';

// Create Express app with all middleware and routes configured
const app = createApp();

// Database connection
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/murai");
mongoose.connection.on("connected", () => {
    console.log("✅ Connected to MongoDB");
});
mongoose.connection.on("error", (err) => {
    console.log("❌ MongoDB connection error", err);
});



export default app;