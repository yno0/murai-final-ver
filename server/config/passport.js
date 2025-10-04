import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/userModel.js';

// Passport serialization
passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Function to dynamically register Google OAuth strategy
function ensureGoogleStrategy() {
    // Check if strategy is already registered
    if (passport._strategies && passport._strategies.google) {
        return true;
    }

    // Only register if credentials are available
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        console.log('🔧 Registering Google OAuth strategy dynamically...');

        const callbackURL = process.env.GOOGLE_CALLBACK_URL || `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`;
        console.log('🔗 Google OAuth Callback URL:', callbackURL);

        passport.use(new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: callbackURL
        }, async (accessToken, refreshToken, profile, done) => {
            try {
                const { findOrCreateGoogleUser } = await import('../controllers/authController.js');
                const user = await findOrCreateGoogleUser(profile);
                return done(null, user);
            } catch (err) {
                console.error('❌ Google OAuth error:', err);
                return done(err, null);
            }
        }));

        console.log('✅ Google OAuth strategy registered dynamically');
        return true;
    }

    return false;
}

// Export the function so routes can use it
passport.ensureGoogleStrategy = ensureGoogleStrategy;

// Try to register Google strategy at startup (will work if env vars are loaded)
console.log('🔍 Debug - GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET');
console.log('🔍 Debug - GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET');

if (!ensureGoogleStrategy()) {
    console.log('⚠️  Google OAuth not configured at startup - will register dynamically when needed');
}

export default passport;