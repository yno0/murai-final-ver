// Simple test script to verify session management API endpoints
// Run this in the browser console when logged in as admin

async function testSessionAPI() {
    const baseURL = 'http://localhost:5000/api/admin/auth';
    
    // Get the JWT token from localStorage
    const token = localStorage.getItem('adminToken');
    if (!token) {
        console.error('❌ No admin token found. Please login first.');
        return;
    }
    
    console.log('🔑 Using token:', token.substring(0, 20) + '...');
    
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
    
    try {
        // Test 1: Get Active Sessions
        console.log('📱 Testing getActiveSessions...');
        const sessionsResponse = await fetch(`${baseURL}/sessions`, { headers });
        const sessionsData = await sessionsResponse.json();
        console.log('📱 Sessions Response:', sessionsData);
        
        // Test 2: Get Login History
        console.log('📊 Testing getLoginHistory...');
        const historyResponse = await fetch(`${baseURL}/login-history`, { headers });
        const historyData = await historyResponse.json();
        console.log('📊 History Response:', historyData);
        
        // Test 3: Get Security Settings
        console.log('⚙️ Testing getSecuritySettings...');
        const settingsResponse = await fetch(`${baseURL}/security-settings`, { headers });
        const settingsData = await settingsResponse.json();
        console.log('⚙️ Settings Response:', settingsData);
        
        console.log('✅ All API tests completed!');
        
    } catch (error) {
        console.error('❌ API Test Error:', error);
    }
}

// Run the test
console.log('🧪 Starting Session API Test...');
testSessionAPI();
