// Test script to submit flagged content via API
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

// Test user credentials (you may need to create this user first)
const TEST_USER = {
    email: 'test@example.com',
    password: 'testpassword123'
};

// Function to login and get token
async function loginUser() {
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(TEST_USER)
        });

        const data = await response.json();
        
        if (data.success) {
            console.log('✅ User login successful');
            return data.data.token;
        } else {
            console.log('❌ User login failed:', data.message);
            return null;
        }
    } catch (error) {
        console.error('❌ Login error:', error.message);
        return null;
    }
}

// Function to create a test user
async function createTestUser() {
    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: 'Test User',
                email: TEST_USER.email,
                password: TEST_USER.password
            })
        });

        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Test user created successfully');
            return true;
        } else {
            console.log('⚠️ User creation failed (may already exist):', data.message);
            return false;
        }
    } catch (error) {
        console.error('❌ User creation error:', error.message);
        return false;
    }
}

// Function to submit flagged content
async function submitFlaggedContent(token, contentData) {
    try {
        const response = await fetch(`${API_BASE}/flagged-content`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'X-Extension-Version': '1.0.0'
            },
            body: JSON.stringify(contentData)
        });

        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Flagged content submitted successfully:', data.data._id);
            return data.data;
        } else {
            console.log('❌ Flagged content submission failed:', data.message);
            return null;
        }
    } catch (error) {
        console.error('❌ Submission error:', error.message);
        return null;
    }
}

// Function to get flagged content
async function getFlaggedContent(token) {
    try {
        const response = await fetch(`${API_BASE}/flagged-content?limit=10`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        
        if (data.success) {
            console.log(`✅ Retrieved ${data.data.content.length} flagged content entries`);
            return data.data.content;
        } else {
            console.log('❌ Failed to get flagged content:', data.message);
            return [];
        }
    } catch (error) {
        console.error('❌ Get flagged content error:', error.message);
        return [];
    }
}

// Main test function
async function main() {
    console.log('🚀 Testing Flagged Content API...\n');

    // Step 1: Create test user (if needed)
    console.log('1. Creating test user...');
    await createTestUser();

    // Step 2: Login to get token
    console.log('\n2. Logging in...');
    const token = await loginUser();
    
    if (!token) {
        console.log('❌ Cannot proceed without authentication token');
        return;
    }

    // Step 3: Submit test flagged content
    console.log('\n3. Submitting test flagged content...');
    
    const testEntries = [
        {
            language: 'English',
            detectedWord: 'badword',
            context: 'This is a test context containing badword that should be flagged',
            sentiment: 'negative',
            confidenceScore: 0.85,
            sourceUrl: 'https://example.com/test1',
            detectionMethod: 'hybrid',
            aiModel: 'roberta-v1',
            processingTime: 150,
            severity: 'high'
        },
        {
            language: 'Filipino',
            detectedWord: 'masama',
            context: 'Ito ay test context na may masama na salita',
            sentiment: 'negative',
            confidenceScore: 0.72,
            sourceUrl: 'https://facebook.com/test2',
            detectionMethod: 'context-aware',
            aiModel: 'roberta-v1',
            processingTime: 200,
            severity: 'medium'
        },
        {
            language: 'Mixed',
            detectedWord: 'offensive',
            context: 'Mixed content with offensive word na dapat ma-detect',
            sentiment: 'negative',
            confidenceScore: 0.91,
            sourceUrl: 'https://twitter.com/test3',
            detectionMethod: 'term-based',
            aiModel: 'roberta-v1',
            processingTime: 120,
            severity: 'high'
        }
    ];

    for (let i = 0; i < testEntries.length; i++) {
        console.log(`  Submitting entry ${i + 1}...`);
        await submitFlaggedContent(token, testEntries[i]);
    }

    // Step 4: Retrieve flagged content
    console.log('\n4. Retrieving flagged content...');
    const flaggedContent = await getFlaggedContent(token);
    
    if (flaggedContent.length > 0) {
        console.log('\n📋 Recent flagged content:');
        flaggedContent.forEach((item, index) => {
            console.log(`  ${index + 1}. "${item.detectedWord}" in ${item.language} (confidence: ${item.confidenceScore})`);
        });
    }

    console.log('\n✅ Test completed! You can now check the admin interface at:');
    console.log('🌐 http://localhost:5173/admin/moderation/flagged-content');
    console.log('🔑 Login with: murai@admin.com / muraitestadmin123');
}

// Run the test
main().catch(console.error);
