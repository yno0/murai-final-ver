// Test script to check admin API for flagged content
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

// Admin credentials
const ADMIN_USER = {
    email: 'murai@admin.com',
    password: 'muraitestadmin123'
};

// Function to login admin and get token
async function loginAdmin() {
    try {
        const response = await fetch(`${API_BASE}/admin/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ADMIN_USER)
        });

        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Admin login successful');
            return data.data.token;
        } else {
            console.log('❌ Admin login failed:', data.message);
            return null;
        }
    } catch (error) {
        console.error('❌ Admin login error:', error.message);
        return null;
    }
}

// Function to get flagged content via admin API
async function getAdminFlaggedContent(token) {
    try {
        const response = await fetch(`${API_BASE}/admin/moderation/flagged?limit=10`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        
        if (data.success) {
            console.log(`✅ Admin API: Retrieved ${data.data.content.length} flagged content entries`);
            console.log(`📊 Total entries: ${data.data.pagination.total}`);
            return data.data;
        } else {
            console.log('❌ Admin API failed:', data.message);
            return null;
        }
    } catch (error) {
        console.error('❌ Admin API error:', error.message);
        return null;
    }
}

// Main test function
async function main() {
    console.log('🚀 Testing Admin Flagged Content API...\n');

    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const token = await loginAdmin();
    
    if (!token) {
        console.log('❌ Cannot proceed without admin authentication token');
        return;
    }

    // Step 2: Get flagged content via admin API
    console.log('\n2. Fetching flagged content via admin API...');
    const result = await getAdminFlaggedContent(token);
    
    if (result && result.content.length > 0) {
        console.log('\n📋 Flagged content from admin API:');
        result.content.forEach((item, index) => {
            console.log(`  ${index + 1}. "${item.detectedWord}" in ${item.language}`);
            console.log(`     Context: ${item.context.substring(0, 50)}...`);
            console.log(`     Source: ${item.sourceUrl}`);
            console.log(`     Confidence: ${item.confidenceScore}`);
            console.log(`     Severity: ${item.metadata?.severity || 'N/A'}`);
            console.log(`     Created: ${new Date(item.createdAt).toLocaleString()}`);
            console.log('');
        });
        
        console.log('✅ Admin API is working correctly!');
        console.log('🌐 The flagged content should now be visible in the admin interface.');
    } else {
        console.log('⚠️ No flagged content found or API error');
    }
}

// Run the test
main().catch(console.error);
