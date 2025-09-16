# MURAi Extension Sync Debug Guide

## Issues Fixed

### ✅ 1. Success Popups Added
- **Save Success**: Shows "Settings saved successfully!" for 3 seconds
- **Sync Success**: Shows "Settings synced successfully!" for 3 seconds
- **Auto-dismiss**: Popups automatically disappear after 3 seconds
- **Manual close**: Click × to close immediately

### ✅ 2. Dropdown Menu Fixed
- **Enhanced click outside detection**: Added multiple event listeners
- **Escape key support**: Press Escape to close menu
- **Higher z-index**: Ensures menu appears above other elements
- **Better styling**: Added border for better visibility

### ✅ 3. Sync Functionality Enhanced
- **Better error handling**: Clear error messages when sync fails
- **Debug logging**: Detailed console logs for troubleshooting
- **State consistency**: Ensures all settings are properly synced

## Testing the Fixes

### Step 1: Reload Extension
1. Go to `chrome://extensions/`
2. Find "MURAi - Online Word Moderator"
3. Click the **refresh/reload button** 🔄

### Step 2: Test Success Popups
1. **Save Test**: 
   - Change any setting in extension
   - Click "Save Settings"
   - Should see green "Settings saved successfully!" popup

2. **Sync Test**:
   - Click user avatar in extension
   - Click "Sync Now"
   - Should see green "Settings synced successfully!" popup

### Step 3: Test Dropdown Menu
1. **Open Menu**: Click user avatar in extension header
2. **Close Methods**:
   - Click outside the menu
   - Press Escape key
   - Click sync or logout (should auto-close)

### Step 4: Test Settings Sync

#### Method A: Extension → Web App
1. **In Extension**:
   - Turn protection ON
   - Set language to "English"
   - Set sensitivity to "High"
   - Add whitelist website: "test.com"
   - Add whitelist term: "example"
   - Click "Save Settings"

2. **In Web App** (`localhost:5173/client/features/extension`):
   - Click "Sync Settings" button
   - Verify all settings match extension

#### Method B: Web App → Extension
1. **In Web App**:
   - Turn protection OFF
   - Set language to "Tagalog"
   - Set sensitivity to "Low"
   - Add different whitelist items
   - Click "Save Preferences"

2. **In Extension**:
   - Click user avatar → "Sync Now"
   - Verify all settings match web app

## Debug Information

### Console Logs to Check

#### Extension Console
```javascript
// Open extension popup, right-click → Inspect
// Look for these logs:
- "Syncing settings from API..."
- "Sync response: {success: true, data: {...}}"
- "Current extension settings before sync: {...}"
- "Synced settings: {...}"
- "Settings synced successfully"
```

#### Web App Console
```javascript
// On localhost:5173, open F12 console
// Look for these logs:
- "Sync extension settings failed:" (if error)
- "Update extension settings failed:" (if error)
```

### Manual Sync Test

If automatic sync isn't working, test manually:

#### 1. Check Current Settings
**Extension Console:**
```javascript
chrome.storage.sync.get(null, (data) => console.log('Extension storage:', data));
```

**Web App Console:**
```javascript
// Check localStorage for auth
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));
```

#### 2. Force Sync from Extension
**Extension Console:**
```javascript
// Get the API service instance and force sync
// This will be available in the extension's context
```

### Common Issues & Solutions

#### Issue: "Settings not syncing between platforms"
**Solution**: 
- Ensure both platforms are logged in with same account
- Check console for API errors
- Verify server is running on localhost:5000

#### Issue: "Dropdown won't close"
**Solution**:
- Reload extension
- Check if clicking outside the extension popup area
- Try pressing Escape key

#### Issue: "No success popup showing"
**Solution**:
- Check if save/sync actually succeeded
- Look for JavaScript errors in console
- Verify popup isn't being blocked by other elements

#### Issue: "Settings revert after sync"
**Solution**:
- Check if API call is actually successful
- Verify token is valid
- Check server logs for errors

## Expected Behavior

### ✅ Working Correctly
- Success popups appear and auto-dismiss
- Dropdown menu closes when clicking outside
- Settings sync bidirectionally between extension and web app
- All setting types sync: protection status, language, sensitivity, whitelist, dictionary
- Error messages show when sync fails

### ❌ Still Issues
- If settings don't sync, check API endpoint responses
- If popups don't show, check for JavaScript errors
- If dropdown doesn't close, try reloading extension

## Next Steps

1. **Test all functionality** with the updated extension
2. **Report specific issues** if any persist
3. **Check console logs** for detailed error information
4. **Verify server connectivity** if sync fails
