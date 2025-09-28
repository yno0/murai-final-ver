import apiService from './api.js';

class ExtensionSettingsService {
  // Get extension settings
  async getSettings() {
    try {
      const response = await apiService.request('/extension-settings');
      // Handle nested response structure from server: { success, data: { settings } }
      return response.data?.settings ? { data: response.data.settings } : response;
    } catch (error) {
      console.error('Get extension settings failed:', error);
      throw error;
    }
  }

  // Update extension settings
  async updateSettings(settings) {
    try {
      const response = await apiService.request('/extension-settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      // Handle nested response structure from server: { success, data: { settings } }
      return response.data?.settings ? { data: response.data.settings } : response;
    } catch (error) {
      console.error('Update extension settings failed:', error);
      throw error;
    }
  }

  // Sync settings (check for updates)
  async syncSettings(lastSyncTimestamp = null) {
    try {
      const endpoint = lastSyncTimestamp 
        ? `/extension-settings/sync?lastSyncTimestamp=${lastSyncTimestamp}`
        : '/extension-settings/sync';
      
      const response = await apiService.request(endpoint);
      // Handle nested response structure from server: { success, data: { settings } }
      return response.data?.settings ? { data: response.data.settings } : response;
    } catch (error) {
      console.error('Sync extension settings failed:', error);
      throw error;
    }
  }

  // Reset settings to default
  async resetSettings() {
    try {
      const response = await apiService.request('/extension-settings/reset', {
        method: 'POST',
      });
      // Handle nested response structure from server: { success, data: { settings } }
      return response.data?.settings ? { data: response.data.settings } : response;
    } catch (error) {
      console.error('Reset extension settings failed:', error);
      throw error;
    }
  }



  // Convert frontend settings format to API format
  convertToApiFormat(settings) {
    return {
      enabled: settings.enabled,
      language: settings.language,
      sensitivity: settings.sensitivity,
      detectionMode: settings.detectionMode || 'term-based',
      flaggingStyle: settings.flaggingStyle,
      highlightColor: settings.highlightColor,
      whitelist: {
        websites: settings.whitelist?.websites || [],
        terms: settings.whitelist?.terms || []
      },
      dictionary: settings.dictionary || []
    };
  }

  // Convert API format to frontend settings format
  convertFromApiFormat(apiSettings) {
    return {
      enabled: apiSettings.enabled,
      language: apiSettings.language,
      sensitivity: apiSettings.sensitivity,
      detectionMode: apiSettings.detectionMode || 'term-based',
      flaggingStyle: apiSettings.flaggingStyle,
      highlightColor: apiSettings.highlightColor,
      whitelist: {
        websites: apiSettings.whitelist?.websites || [],
        terms: apiSettings.whitelist?.terms || []
      },
      dictionary: apiSettings.dictionary || [],
      lastSync: apiSettings.lastSync,
      syncStatus: apiSettings.syncStatus,
      version: apiSettings.version
    };
  }

  // Get default settings
  getDefaultSettings() {
    return {
      enabled: true,
      language: 'Both',
      sensitivity: 'medium',
      detectionMode: 'term-based',
      flaggingStyle: 'highlight',
      highlightColor: '#374151',
      whitelist: {
        websites: [],
        terms: []
      },
      dictionary: [],
      lastSync: new Date().toISOString(),
      syncStatus: 'synced',
      version: '1.0.0'
    };
  }

  // Validate settings before sending to API
  validateSettings(settings) {
    const errors = [];

    if (typeof settings.enabled !== 'boolean') {
      errors.push('Enabled must be a boolean value');
    }

    if (settings.language && !['English', 'Tagalog', 'Taglish', 'Both'].includes(settings.language)) {
      errors.push('Invalid language option');
    }

    if (settings.sensitivity && !['low', 'medium', 'high'].includes(settings.sensitivity)) {
      errors.push('Invalid sensitivity level');
    }

    if (settings.flaggingStyle && !['blur', 'highlight', 'asterisk', 'underline', 'none'].includes(settings.flaggingStyle)) {
      errors.push('Invalid flagging style');
    }

    if (settings.highlightColor && !/^#[0-9A-F]{6}$/i.test(settings.highlightColor)) {
      errors.push('Invalid color format. Use hex format like #374151');
    }

    if (settings.whitelist) {
      if (settings.whitelist.websites && !Array.isArray(settings.whitelist.websites)) {
        errors.push('Whitelist websites must be an array');
      }
      if (settings.whitelist.terms && !Array.isArray(settings.whitelist.terms)) {
        errors.push('Whitelist terms must be an array');
      }
    }

    if (settings.dictionary && !Array.isArray(settings.dictionary)) {
      errors.push('Dictionary must be an array');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Create and export a singleton instance
const extensionSettingsService = new ExtensionSettingsService();
export default extensionSettingsService;
