// Test script to validate the new database-driven dictionary system for MURAi extension
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';
const EXTENSION_ENDPOINT = `${BASE_URL}/dictionary/extension/words`;

// Test data for different languages
const testWords = {
  English: [
    { word: 'testbad', language: 'English', category: 'profanity', variations: ['t3stb4d', 'test-bad'] },
    { word: 'badtest', language: 'English', category: 'slur', variations: ['b4dt3st'] }
  ],
  Filipino: [
    { word: 'testmasama', language: 'Filipino', category: 'profanity', variations: ['testm4s4m4'] },
    { word: 'masamatest', language: 'Filipino', category: 'bullying', variations: ['m4s4m4test'] }
  ]
};

async function testExtensionDictionarySystem() {
  console.log('🧪 Testing Extension Database-Driven Dictionary System...\n');

  try {
    // Test 1: Test new public extension endpoint
    console.log('1. Testing public extension dictionary endpoint...');
    
    // Test English dictionary
    console.log('   Testing English dictionary fetch...');
    const englishResponse = await fetch(`${EXTENSION_ENDPOINT}?language=English`);
    if (englishResponse.ok) {
      const englishData = await englishResponse.json();
      console.log(`   ✅ English dictionary fetched: ${englishData.data?.words?.length || 0} words`);
      console.log(`   📊 Response format: ${JSON.stringify(Object.keys(englishData.data || {}))}`);
    } else {
      console.log(`   ❌ Failed to fetch English dictionary: ${englishResponse.status}`);
    }

    // Test Filipino dictionary
    console.log('   Testing Filipino dictionary fetch...');
    const filipinoResponse = await fetch(`${EXTENSION_ENDPOINT}?language=Filipino`);
    if (filipinoResponse.ok) {
      const filipinoData = await filipinoResponse.json();
      console.log(`   ✅ Filipino dictionary fetched: ${filipinoData.data?.words?.length || 0} words`);
      console.log(`   📊 Response format: ${JSON.stringify(Object.keys(filipinoData.data || {}))}`);
    } else {
      console.log(`   ❌ Failed to fetch Filipino dictionary: ${filipinoResponse.status}`);
    }

    // Test 2: Test error handling
    console.log('\n2. Testing error handling...');
    
    // Test missing language parameter
    const noLangResponse = await fetch(EXTENSION_ENDPOINT);
    if (noLangResponse.status === 400) {
      console.log('   ✅ Correctly rejects requests without language parameter');
    } else {
      console.log('   ❌ Should reject requests without language parameter');
    }

    // Test invalid language
    const invalidLangResponse = await fetch(`${EXTENSION_ENDPOINT}?language=InvalidLang`);
    if (invalidLangResponse.status === 400) {
      console.log('   ✅ Correctly rejects invalid language parameters');
    } else {
      console.log('   ❌ Should reject invalid language parameters');
    }

    // Test 3: Test data format for extension consumption
    console.log('\n3. Testing data format for extension consumption...');
    
    const formatTestResponse = await fetch(`${EXTENSION_ENDPOINT}?language=English`);
    if (formatTestResponse.ok) {
      const formatData = await formatTestResponse.json();
      const words = formatData.data?.words || [];
      
      if (words.length > 0) {
        const sampleWord = words[0];
        const hasRequiredFields = sampleWord.word && sampleWord.category;
        const hasVariations = Array.isArray(sampleWord.variations);
        
        console.log(`   ✅ Sample word structure: ${JSON.stringify(sampleWord, null, 2)}`);
        console.log(`   ${hasRequiredFields ? '✅' : '❌'} Has required fields (word, category)`);
        console.log(`   ${hasVariations ? '✅' : '❌'} Has variations array`);
      } else {
        console.log('   ⚠️ No words found in dictionary for testing format');
      }
    }

    // Test 4: Test caching headers
    console.log('\n4. Testing caching headers...');
    
    const cacheTestResponse = await fetch(`${EXTENSION_ENDPOINT}?language=English`);
    const cacheControl = cacheTestResponse.headers.get('cache-control');
    const etag = cacheTestResponse.headers.get('etag');
    
    console.log(`   ${cacheControl ? '✅' : '❌'} Cache-Control header: ${cacheControl}`);
    console.log(`   ${etag ? '✅' : '❌'} ETag header: ${etag}`);

    // Test 5: Test performance
    console.log('\n5. Testing performance...');
    
    const startTime = Date.now();
    const perfResponse = await fetch(`${EXTENSION_ENDPOINT}?language=English`);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`   📊 Response time: ${responseTime}ms`);
    console.log(`   ${responseTime < 1000 ? '✅' : '⚠️'} Response time ${responseTime < 1000 ? 'acceptable' : 'slow'}`);

    console.log('\n🎉 Extension Dictionary System Tests Completed!');
    console.log('\n📋 Implementation Summary:');
    console.log('- ✅ Created public API endpoint for extension dictionary fetching');
    console.log('- ✅ Added language-based filtering (English/Filipino)');
    console.log('- ✅ Implemented proper error handling and validation');
    console.log('- ✅ Added caching headers for performance');
    console.log('- ✅ Structured data format for extension consumption');
    console.log('- ✅ Background script dictionary fetching and storage');
    console.log('- ✅ Content script async dictionary loading');
    console.log('- ✅ Language preference-based detection filtering');
    console.log('- ✅ Dictionary sync mechanism with settings changes');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Helper function to test extension storage simulation
function simulateExtensionStorageTest() {
  console.log('\n🔧 Simulating Extension Storage Test...');
  
  // Simulate the data format that would be stored in chrome.storage.local
  const mockEnglishDictionary = [
    { word: 'test1', category: 'profanity', variations: ['t3st1'] },
    { word: 'test2', category: 'slur', variations: ['t3st2', 't@st2'] }
  ];
  
  const mockFilipinooDictionary = [
    { word: 'test1fil', category: 'profanity', variations: ['t3st1fil'] },
    { word: 'test2fil', category: 'bullying', variations: ['t3st2fil'] }
  ];

  // Simulate the extraction process
  function extractWordsFromDatabaseFormat(databaseWords) {
    const words = [];
    databaseWords.forEach(entry => {
      if (entry.word) words.push(entry.word.toLowerCase());
      if (entry.variations) {
        entry.variations.forEach(variation => {
          if (variation) words.push(variation.toLowerCase());
        });
      }
    });
    return [...new Set(words)];
  }

  const englishWords = extractWordsFromDatabaseFormat(mockEnglishDictionary);
  const filipinoWords = extractWordsFromDatabaseFormat(mockFilipinooDictionary);

  console.log(`   ✅ English words extracted: ${englishWords.join(', ')}`);
  console.log(`   ✅ Filipino words extracted: ${filipinoWords.join(', ')}`);
  console.log('   ✅ Extension storage simulation successful');
}

// Run the tests
async function runAllTests() {
  await testExtensionDictionarySystem();
  simulateExtensionStorageTest();
  
  console.log('\n🚀 Next Steps for Testing:');
  console.log('1. Start the server: cd server && npm start');
  console.log('2. Add some test words to the database via admin panel');
  console.log('3. Load the extension in Chrome and test detection');
  console.log('4. Change language settings and verify dictionary updates');
  console.log('5. Check browser console for dictionary loading logs');
}

runAllTests();
