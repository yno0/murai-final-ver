# Simple MURAi Extension Test Guide

## What Changed
✅ **Removed complex login detector**
✅ **Simplified to direct token checking**
✅ **Extension now checks for login when popup opens**
✅ **Added "Sync with Web App" button for manual sync**

## How to Test

### Step 1: Reload Extension
1. Go to `chrome://extensions/`
2. Find "MURAi - Online Word Moderator"
3. Click the **refresh/reload button** 🔄

### Step 2: Make Sure You're Logged In
1. Open `http://localhost:5173` in a tab
2. Log in with your credentials
3. Verify you can see the dashboard/logged-in content

### Step 3: Test Extension
1. **Keep the logged-in tab open**
2. Click the MURAi extension icon
3. The extension should **automatically detect** your login and show settings

### Step 4: If Auto-Detection Fails
1. Click the **"Sync with Web App"** button
2. This will manually check the current tab for login tokens
3. If successful, you'll see your settings

## Expected Results

### ✅ Success Indicators
- Extension shows your actual user name
- Settings interface is visible
- Sync status shows "Synced"
- You can modify and save settings

### ❌ If Still Not Working
- Extension shows "Please log in to access your settings"
- Click "Sync with Web App" button
- Check browser console for error messages

## How It Works Now

### Automatic Detection
- Extension checks for tokens when popup opens
- Looks in both localStorage and sessionStorage
- Validates token with server
- Loads user data and settings

### Manual Sync
- "Sync with Web App" button actively scans current tab
- Extracts tokens from the web page
- Stores them in extension storage
- Immediately loads user data

### No More Content Scripts
- Removed complex login detector
- No more message passing between scripts
- Direct token extraction when needed
- Simpler and more reliable

## Debug Information

If you want to see what's happening:

1. **Extension Console**: Right-click extension icon → Inspect popup
2. **Web Page Console**: F12 on localhost:5173 tab
3. **Check Token**: In web page console, run:
   ```javascript
   console.log('Token:', localStorage.getItem('token'));
   ```

## The Key Difference

**Before**: Complex content script trying to detect login events
**Now**: Simple direct check when extension opens + manual sync button

This approach is much more reliable because it doesn't depend on detecting login events - it just checks if you're currently logged in whenever you open the extension.
