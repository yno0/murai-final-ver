import ExtensionSettings from '../models/extensionSettingsModel.js';
import User from '../models/userModel.js';

// Get extension settings for a user
export const getSettings = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const settings = await ExtensionSettings.getOrCreateSettings(userId, null);

        console.log('🔍 FETCHING extension settings for user:', userId);
        console.log('🎯 Current detectionMode in database:', settings.detectionMode);
        console.log('📤 Sending response:', JSON.stringify(settings.toApiResponse(), null, 2));

        res.json({
            success: true,
            data: {
                settings: settings.toApiResponse()
            }
        });

    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update extension settings
export const updateSettings = async (req, res) => {
    try {
        const userId = req.user.userId;
        const {
            enabled,
            language,
            sensitivity,
            detectionMode,
            flaggingStyle,
            highlightColor,
            whitelist,
            dictionary
        } = req.body;

        console.log('🔄 SAVING extension settings for user:', userId);
        console.log('📥 Request body:', JSON.stringify(req.body, null, 2));
        console.log('🎯 Detection mode in request:', detectionMode);

        // Validate required fields
        if (enabled !== undefined && typeof enabled !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'Enabled must be a boolean value'
            });
        }

        if (language && !['English', 'Tagalog', 'Taglish', 'Both'].includes(language)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid language option'
            });
        }

        if (sensitivity && !['low', 'medium', 'high'].includes(sensitivity)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid sensitivity level'
            });
        }

        if (detectionMode && !['term-based', 'context-aware'].includes(detectionMode)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid detection mode'
            });
        }

        if (flaggingStyle && !['blur', 'highlight', 'asterisk', 'underline', 'none'].includes(flaggingStyle)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid flagging style'
            });
        }

        if (highlightColor && !/^#[0-9A-F]{6}$/i.test(highlightColor)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid color format. Use hex format like #374151'
            });
        }

        // Get or create settings
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        let settings = await ExtensionSettings.findOne({ userId });
        
        if (!settings) {
            settings = new ExtensionSettings({
                userId,
                groupId: null,
                enabled: true,
                language: 'Both',
                sensitivity: 'medium',
                flaggingStyle: 'highlight',
                highlightColor: '#374151',
                whitelist: { websites: [], terms: [] },
                dictionary: []
            });
        }

        // Update settings
        if (enabled !== undefined) settings.enabled = enabled;
        if (language) settings.language = language;
        if (sensitivity) settings.sensitivity = sensitivity;
        if (detectionMode) {
            console.log('🎯 Updating detectionMode from:', settings.detectionMode, 'to:', detectionMode);
            settings.detectionMode = detectionMode;
        }
        if (flaggingStyle) settings.flaggingStyle = flaggingStyle;
        if (highlightColor) settings.highlightColor = highlightColor;
        
        if (whitelist) {
            if (whitelist.websites && Array.isArray(whitelist.websites)) {
                settings.whitelist.websites = whitelist.websites.filter(website => 
                    website && typeof website === 'string' && website.trim().length > 0
                );
            }
            if (whitelist.terms && Array.isArray(whitelist.terms)) {
                settings.whitelist.terms = whitelist.terms.filter(term => 
                    term && typeof term === 'string' && term.trim().length > 0
                );
            }
        }
        
        if (dictionary && Array.isArray(dictionary)) {
            settings.dictionary = dictionary.filter(word => 
                word && typeof word === 'string' && word.trim().length > 0
            );
        }

        // Update device info
        settings.deviceInfo = {
            userAgent: req.get('User-Agent') || '',
            platform: req.get('Sec-Ch-Ua-Platform') || '',
            browser: req.get('Sec-Ch-Ua') || ''
        };

        // Update sync status
        settings.syncStatus = 'synced';
        settings.lastSyncAt = new Date();

        await settings.save();

        console.log('✅ Settings saved to database successfully');
        console.log('🎯 Final detectionMode in database:', settings.detectionMode);
        console.log('📤 Response data:', JSON.stringify(settings.toApiResponse(), null, 2));

        res.json({
            success: true,
            message: 'Settings updated successfully',
            data: {
                settings: settings.toApiResponse()
            }
        });

    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Sync settings (for extension sync functionality)
export const syncSettings = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { lastSyncTimestamp } = req.query;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const settings = await ExtensionSettings.getOrCreateSettings(userId, null);
        
        // Check if settings have been updated since last sync
        const lastSync = lastSyncTimestamp ? new Date(lastSyncTimestamp) : new Date(0);
        const settingsUpdated = settings.updatedAt > lastSync;

        // Update sync status
        await settings.updateSyncStatus('synced');

        res.json({
            success: true,
            data: {
                settings: settings.toApiResponse(),
                hasUpdates: settingsUpdated,
                lastSync: settings.lastSyncAt
            }
        });

    } catch (error) {
        console.error('Sync settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Reset settings to default
export const resetSettings = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Delete existing settings
        await ExtensionSettings.findOneAndDelete({ userId });

        // Create new default settings
        const defaultSettings = new ExtensionSettings({
            userId,
            groupId: null,
            enabled: true,
            language: 'Both',
            sensitivity: 'medium',
            detectionMode: 'term-based',
            flaggingStyle: 'highlight',
            highlightColor: '#374151',
            whitelist: { websites: [], terms: [] },
            dictionary: [],
            lastSyncAt: new Date(),
            syncStatus: 'synced'
        });

        await defaultSettings.save();

        res.json({
            success: true,
            message: 'Settings reset to default successfully',
            data: {
                settings: defaultSettings.toApiResponse()
            }
        });

    } catch (error) {
        console.error('Reset settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};


