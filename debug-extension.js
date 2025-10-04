// Debug script to check MURAi extension state
// Run this in the browser console on a page where detection should work

console.log('🔍 MURAi Extension Debug Script');

// Check if extension is loaded
if (typeof window.muraiContentScript !== 'undefined') {
  console.log('✅ MURAi content script is loaded');
  
  // Get detection stats
  const stats = window.muraiContentScript.getDetectionStats();
  console.log('📊 Detection Stats:', stats);
  
} else if (typeof window.MuraiEnhancedContentScript !== 'undefined') {
  console.log('✅ MURAi Enhanced content script is loaded');
  
  // Check detection engine
  if (window.MuraiEnhancedContentScript.detectionEngine) {
    const engine = window.MuraiEnhancedContentScript.detectionEngine;
    console.log('🔧 Detection Engine State:', {
      isInitialized: engine.isInitialized,
      isActive: engine.isActive,
      flaggedElements: engine.flaggedElements?.size || 0
    });
    
    // Check dictionary service
    if (engine.dictionaryService) {
      const dictStats = engine.dictionaryService.getStats();
      console.log('📚 Dictionary Service Stats:', dictStats);
      
      // Test dictionary loading
      console.log('🧪 Testing dictionary...');
      engine.dictionaryService.testDetection('This is a test with bad words like ass and shit');
    }
  }
} else {
  console.log('❌ MURAi content script not found');
}

// Check chrome storage
chrome.storage.local.get(['englishDictionary', 'filipinoDictionary', 'dictionaryLastUpdated'], (result) => {
  console.log('💾 Chrome Storage State:', {
    englishWords: result.englishDictionary?.length || 0,
    filipinoWords: result.filipinoDictionary?.length || 0,
    lastUpdated: result.dictionaryLastUpdated ? new Date(result.dictionaryLastUpdated).toISOString() : 'Never'
  });
  
  if (result.englishDictionary?.length > 0) {
    console.log('📝 Sample English words:', result.englishDictionary.slice(0, 5).map(w => w.word));
  }
});

// Check sync storage (settings)
chrome.storage.sync.get(null, (settings) => {
  console.log('⚙️ Extension Settings:', settings);
});

// Test manual detection
function testDetection(text = 'This text contains ass and shit') {
  console.log('🧪 Manual Detection Test for:', text);
  
  if (window.muraiContentScript?.badWordDictionary) {
    const matches = window.muraiContentScript.badWordDictionary.scanText(text.toLowerCase(), text);
    console.log('📊 Detection Results:', matches);
  } else if (window.MuraiEnhancedContentScript?.detectionEngine?.dictionaryService) {
    window.MuraiEnhancedContentScript.detectionEngine.dictionaryService.scanText(text)
      .then(matches => {
        console.log('📊 Detection Results:', matches);
      })
      .catch(error => {
        console.error('❌ Detection Error:', error);
      });
  } else {
    console.log('❌ No detection service available');
  }
}

// Test with common words
testDetection('ass');
testDetection('shit');
testDetection('fuck');

// Check if ProfanityDictionary is loaded
if (typeof window.ProfanityDictionary !== 'undefined') {
  console.log('✅ ProfanityDictionary class available');
  
  // Create test instance
  const testDict = new window.ProfanityDictionary();
  testDict.ensureLoaded().then(() => {
    console.log('📚 Test Dictionary Stats:', testDict.getDictionaryStats());
    
    // Test scanning
    const testResults = testDict.scanTextSync('test ass shit');
    console.log('🧪 Test Scan Results:', testResults);
  });
} else {
  console.log('❌ ProfanityDictionary class not available');
}

console.log('🔍 Debug script completed. Check the logs above for issues.');
