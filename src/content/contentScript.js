/* global chrome */

/**
 * MURAi Advanced Content Detection System
 * Comprehensive word flagging with RoBERTa API integration and performance optimizations
 */

class MuraiContentScript {
  constructor() {
    this.settings = null;
    this.isActive = false;
    this.observer = null;
    this.flaggedElements = new Set();
    this.cache = new Map(); // URL-based result caching
    this.processedNodes = new WeakSet();
    this.isInitialized = false;
    this.badWordDictionary = null;
    this.robertaService = null;
    this.contextCache = new Map(); // Cache for context extraction
    this.instantProtectionHandover = false;

    console.log('🚀 MURAi Advanced Content Detection System initializing...');

    // Check if instant protection is active
    if (window.muraiInstantProtection) {
      const hiddenCount = window.muraiInstantProtection.getHiddenCount();
      console.log(`⚡ MURAi: Instant protection already protected ${hiddenCount} elements`);
    }

    this.init();
  }

  async init() {
    if (this.isInitialized) return;

    try {
      console.log('📋 Loading settings and initializing services...');

      // Load comprehensive settings
      await this.loadSettings();

      // Initialize detection services
      this.initializeServices();

      // Set up message listener
      this.setupMessageListener();

      // Start detection if enabled
      if (this.settings.enabled) {
        console.log('🚀 MURAi: Starting detection (enabled in settings)');
        await this.startDetection();
      } else {
        console.log('⚠️ MURAi: Detection disabled in settings');
      }

      // Respect user's enabled/disabled setting - no force start
      if (!this.isActive && this.settings.enabled) {
        console.log('🔧 MURAi: Detection should be active but isn\'t - attempting start');
        try {
          await this.startDetection();
        } catch (error) {
          console.error('❌ MURAi: Detection start failed:', error);
        }
      } else if (!this.settings.enabled) {
        console.log('✅ MURAi: Detection properly disabled - respecting user setting');
      }

      // Handle instant protection handover
      this.handleInstantProtectionHandover();

      this.isInitialized = true;
      console.log('✅ MURAi: Advanced content detection system initialized successfully');

    } catch (error) {
      console.error('❌ MURAi: Failed to initialize content detection system:', error);
    }
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get([
        'protectionEnabled', 'language', 'flagStyle',
        'highlightColor', 'whitelistWebsites', 'whitelistTerms', 'dictionary',
        'showHighlight', 'blurAmount', 'confidenceThreshold', 'detectionMode'
      ]);

      this.settings = {
        enabled: result.protectionEnabled !== false,
        language: result.language || 'Mixed',
        flagStyle: result.flagStyle || 'highlight',
        highlightColor: result.highlightColor || '#ff6b6b',
        whitelistWebsites: result.whitelistWebsites || [],
        whitelistTerms: result.whitelistTerms || [],
        dictionary: result.dictionary || [],
        showHighlight: result.showHighlight !== false,
        blurAmount: result.blurAmount || 5,
        confidenceThreshold: result.confidenceThreshold || 0.7,
        detectionMode: result.detectionMode || 'term-based'
      };

      console.log('📋 MURAi: Comprehensive settings loaded:', this.settings);
    } catch (error) {
      console.error('❌ MURAi: Error loading settings:', error);
      this.settings = {
        enabled: true, // Enable by default even if settings fail to load
        language: 'Mixed',
        flagStyle: 'highlight',
        highlightColor: '#ff6b6b',
        whitelistWebsites: [],
        whitelistTerms: [],
        dictionary: [],
        showHighlight: true,
        blurAmount: 5,
        confidenceThreshold: 0.7,
        detectionMode: 'term-based'
      };
      console.log('⚠️ MURAi: Using default settings with protection ENABLED');
    }
  }

  initializeServices() {
    // Initialize optimized bad word dictionary service
    this.badWordDictionary = new OptimizedBadWordDictionary(this.settings);

    // Initialize RoBERTa API service with proper error handling
    this.robertaService = new RoBERTaService();

    console.log('🔧 Detection services initialized');
  }

  async startDetection() {
    if (this.isActive) return;

    try {
      console.log('🔍 Starting advanced content detection...');

      // Check if current site is whitelisted
      if (this.isWhitelisted(window.location.href)) {
        console.log('🚫 Site is whitelisted, skipping detection');
        return;
      }

      // Perform initial full DOM scan with pre-processing
      await this.performFullDOMScan();

      // Set up mutation observer for dynamic content
      this.setupMutationObserver();

      this.isActive = true;
      console.log('✅ Content detection active');

    } catch (error) {
      console.error('❌ Error starting detection:', error);
    }
  }

  async performFullDOMScan() {
    console.log('🔍 Performing full DOM scan for pre-processing...');

    // Get all text nodes in the document
    const textNodes = this.getAllTextNodes(document.body);

    console.log(`📊 Found ${textNodes.length} text nodes to scan`);

    // Process all nodes to ensure flagged content appears before user scrolls
    await this.processBatchedTextNodes(textNodes);

    console.log('✅ Full DOM scan completed');
  }

  getAllTextNodes(element) {
    const textNodes = [];
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // Skip script, style, and already processed nodes
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;

          const tagName = parent.tagName.toLowerCase();
          if (['script', 'style', 'noscript'].includes(tagName)) {
            return NodeFilter.FILTER_REJECT;
          }

          // Skip if already processed
          if (this.processedNodes.has(node)) {
            return NodeFilter.FILTER_REJECT;
          }

          // Skip if text is too short or empty
          const text = node.textContent.trim();
          if (text.length < 2) {
            return NodeFilter.FILTER_REJECT;
          }

          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node);
    }

    return textNodes;
  }

  async processBatchedTextNodes(textNodes) {
    const batchSize = 50; // Process 50 nodes at a time

    for (let i = 0; i < textNodes.length; i += batchSize) {
      const batch = textNodes.slice(i, i + batchSize);

      // Process batch with context extraction
      await this.processBatchWithContext(batch);

      // Small delay to prevent blocking
      if (i + batchSize < textNodes.length) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
  }

  async processBatchWithContext(textNodes) {
    const detectedContexts = [];

    for (const node of textNodes) {
      try {
        // Mark as processed
        this.processedNodes.add(node);

        // Get full text content
        const text = node.textContent;
        const normalizedText = this.normalizeText(text);

        // Fast dictionary scan for bad words
        const matches = this.badWordDictionary.scanText(normalizedText, text);

        if (matches.length > 0) {
          // Extract FULL CONTEXT (±5 words) around each match
          for (const match of matches) {
            const contextInfo = this.extractFullContext(text, match);

            detectedContexts.push({
              contextText: contextInfo.contextText,
              fullText: text,
              node,
              match,
              contextStart: contextInfo.contextStart,
              contextEnd: contextInfo.contextEnd,
              originalMatch: match
            });
          }
        }

      } catch (error) {
        console.error('❌ Error processing text node:', error);
      }
    }

    // Handle contexts based on detection mode
    if (detectedContexts.length > 0) {
      if ((this.settings.detectionMode || 'term-based') === 'term-based') {
        for (const ctx of detectedContexts) {
          await this.flagFullContext(ctx, {
            is_toxic: true,
            confidence: 1.0,
            reason: 'Dictionary match (Term-based mode)'
          });
        }
      } else {
        await this.analyzeContextsWithRoBERTa(detectedContexts);
      }
    }
  }

  extractFullContext(text, match) {
    // Split text into words while preserving positions
    const words = text.split(/(\s+)/); // Keep whitespace
    let currentPos = 0;
    const wordPositions = [];

    // Map word positions
    for (let i = 0; i < words.length; i++) {
      if (words[i].trim()) { // Only count non-whitespace words
        wordPositions.push({
          word: words[i],
          start: currentPos,
          end: currentPos + words[i].length,
          index: Math.floor(i / 2) // Actual word index (ignoring whitespace)
        });
      }
      currentPos += words[i].length;
    }

    // Find the word that contains our match
    let matchWordIndex = -1;
    for (let i = 0; i < wordPositions.length; i++) {
      const wordPos = wordPositions[i];
      if (match.start >= wordPos.start && match.end <= wordPos.end) {
        matchWordIndex = i;
        break;
      }
    }

    if (matchWordIndex === -1) {
      // Fallback: return the match itself
      return {
        contextText: text.substring(match.start, match.end),
        contextStart: match.start,
        contextEnd: match.end
      };
    }

    // Extract ±5 words around the match
    const contextStart = Math.max(0, matchWordIndex - 5);
    const contextEnd = Math.min(wordPositions.length, matchWordIndex + 6);

    const contextWords = wordPositions.slice(contextStart, contextEnd);
    const fullContextStart = contextWords[0].start;
    const fullContextEnd = contextWords[contextWords.length - 1].end;

    return {
      contextText: text.substring(fullContextStart, fullContextEnd),
      contextStart: fullContextStart,
      contextEnd: fullContextEnd
    };
  }

  async analyzeContextsWithRoBERTa(detectedContexts) {
    try {
      console.log(`🤖 Analyzing ${detectedContexts.length} contexts with RoBERTa...`);

      // Check cache first
      const uncachedContexts = [];
      const cachedResults = [];

      for (const context of detectedContexts) {
        const cacheKey = this.getCacheKey(context.contextText);
        if (this.cache.has(cacheKey)) {
          cachedResults.push({
            context,
            result: this.cache.get(cacheKey)
          });
        } else {
          uncachedContexts.push(context);
        }
      }

      console.log(`📊 Cache hit: ${cachedResults.length}, Cache miss: ${uncachedContexts.length}`);

      // Process cached results immediately with smart logic
      for (const cached of cachedResults) {
        if (cached.result.is_toxic && cached.result.confidence >= this.settings.confidenceThreshold) {
          console.log(`🚩 Flagging cached toxic content: "${cached.context.contextText}"`);
          await this.flagFullContext(cached.context, cached.result);
        } else if (cached.result.is_toxic === false) {
          console.log(`✅ Cached content marked as clean: "${cached.context.contextText}"`);
        }
      }

      // Send uncached contexts to RoBERTa API
      if (uncachedContexts.length > 0) {
        const contextTexts = uncachedContexts.map(item => item.contextText);
        const results = await this.robertaService.analyzeBatch(contextTexts, this.getLanguageCode());

        // Process results and cache them
        for (let i = 0; i < uncachedContexts.length; i++) {
          const context = uncachedContexts[i];
          const result = results[i] || { confidence: 0.8, reason: 'API unavailable - dictionary match' };

          // Cache the result
          const cacheKey = this.getCacheKey(context.contextText);
          this.cache.set(cacheKey, result);

          // Smart flagging: Check both is_toxic AND confidence
          if (result.is_toxic && result.confidence >= this.settings.confidenceThreshold) {
            console.log(`🚩 Flagging toxic content: "${context.contextText}" (confidence: ${result.confidence})`);
            await this.flagFullContext(context, result);
          } else if (result.is_toxic === false) {
            console.log(`✅ Content marked as clean by API: "${context.contextText}" (confidence: ${result.confidence})`);
          } else if (result.confidence < this.settings.confidenceThreshold) {
            console.log(`⚠️ Low confidence, not flagging: "${context.contextText}" (confidence: ${result.confidence})`);
          }
        }
      }

    } catch (error) {
      console.error('❌ Error analyzing with RoBERTa:', error);
      // Smart fallback: Only flag clearly inappropriate contexts
      for (const context of detectedContexts) {
        const shouldFlag = this.isContextClearlyInappropriate(context.contextText);
        if (shouldFlag) {
          console.log(`🚩 Fallback flagging clearly inappropriate: "${context.contextText}"`);
          await this.flagFullContext(context, {
            confidence: 0.7,
            reason: 'Dictionary match - clearly inappropriate (API unavailable)',
            is_toxic: true
          });
        } else {
          console.log(`⚠️ Fallback skipping ambiguous context: "${context.contextText}"`);
        }
      }
    }
  }

  getLanguageCode() {
    try {
      const lang = (this.settings.language || '').toLowerCase();
      // Map settings to API language codes
      if (lang.includes('tagalog') || lang.includes('taglish') || lang.includes('both') || lang.includes('mixed') || lang === 'fil') {
        return 'fil';
      }
      return 'en';
    } catch (e) {
      return 'fil';
    }
  }

  getCacheKey(text) {
    // Simple hash for caching
    return btoa(text.toLowerCase().trim()).substring(0, 20);
  }

  /**
   * Smart context analysis to reduce false positives
   * Only flags content that is clearly inappropriate based on context
   */
  isContextClearlyInappropriate(contextText) {
    const lowerContext = contextText.toLowerCase();

    // Positive/neutral usage patterns that should NOT be flagged
    const positivePatterns = [
      // Positive expressions
      /\b(damn|hell)\s+(good|great|awesome|amazing|cool|nice|beautiful|perfect|right|yes)\b/,
      /\b(fucking|damn)\s+(amazing|awesome|brilliant|good|great|love|like)\b/,
      /\bhell\s+(yeah|yes)\b/,
      /\bdamn\s+(proud|happy|excited|grateful)\b/,

      // Neutral/descriptive usage
      /\bwhat\s+the\s+hell\s+(is|are|was|were)\b/,
      /\bwhere\s+the\s+hell\b/,
      /\bhow\s+the\s+hell\b/,
      /\bwho\s+the\s+hell\b/,

      // Expressions of frustration with objects/situations (not people)
      /\b(damn|hell)\s+(weather|traffic|computer|internet|phone|car)\b/,
      /\bthis\s+(damn|fucking)\s+(thing|device|app|website|game)\b/,

      // Tagalog positive expressions
      /\bganda\s+ng\b/,  // "beautiful/nice"
      /\bgaling\s+(ng|naman)\b/,  // "great/awesome"
      /\bshet\s+(ganda|galing)\b/  // positive expressions with mild profanity
    ];

    // Check if context matches positive patterns
    for (const pattern of positivePatterns) {
      if (pattern.test(lowerContext)) {
        return false; // Don't flag positive usage
      }
    }

    // Clearly inappropriate patterns that should ALWAYS be flagged
    const clearlyInappropriatePatterns = [
      // Direct insults to people
      /\b(you|he|she|they)\s+(are|is)\s+a?\s*(fucking|damn|stupid|idiot)\b/,
      /\b(fuck|shit)\s+(you|him|her|them)\b/,
      /\b(fucking|damn)\s+(idiot|moron|stupid|dumb)\b/,

      // Aggressive/hostile language
      /\bgo\s+(fuck|damn)\s+yourself\b/,
      /\bfuck\s+(off|this|that)\b/,
      /\bshut\s+the\s+fuck\s+up\b/,

      // Tagalog insults
      /\b(gago|tanga|bobo)\s+(ka|kayo|siya)\b/,
      /\btangina\s+(mo|nyo|nila)\b/,
      /\bputang\s+ina\b/,

      // Sexual/vulgar content
      /\b(pussy|dick|cock|cunt)\b/,
      /\bfuck\s+(me|her|him)\b/,

      // Hate speech indicators
      /\b(fucking|damn)\s+(hate|kill|destroy)\b/
    ];

    // Check if context matches clearly inappropriate patterns
    for (const pattern of clearlyInappropriatePatterns) {
      if (pattern.test(lowerContext)) {
        return true; // Flag clearly inappropriate usage
      }
    }

    // For ambiguous cases, check word count and context
    const words = contextText.split(/\s+/);
    const badWordCount = words.filter(word => {
      const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
      return ['fuck', 'fucking', 'shit', 'damn', 'bitch', 'ass', 'hell', 'tangina', 'gago', 'puta'].includes(cleanWord);
    }).length;

    // If multiple bad words in short context, likely inappropriate
    if (badWordCount >= 2 && words.length <= 10) {
      return true;
    }

    // Default: Don't flag ambiguous cases (let API decide when available)
    return false;
  }

  async flagFullContext(contextInfo, analysis) {
    try {
      const element = contextInfo.node.parentElement;
      if (!element || this.flaggedElements.has(element)) return;

      // Create flagged content wrapper for FULL CONTEXT
      const wrapper = this.createContextWrapper(contextInfo, analysis);

      // Replace original content with flagged context
      element.replaceChild(wrapper, contextInfo.node);

      // Track flagged element
      this.flaggedElements.add(wrapper);

      console.log(`🚩 Full context flagged: "${contextInfo.contextText.substring(0, 50)}..." (confidence: ${analysis.confidence})`);

      // Submit detection data to server (async, non-blocking)
      this.submitDetectionToServer(contextInfo, analysis).catch(error => {
        console.warn('⚠️ Failed to submit detection to server:', error);
      });

    } catch (error) {
      console.error('❌ Error flagging context:', error);
    }
  }

  createContextWrapper(contextInfo, analysis) {
    const wrapper = document.createElement('span');
    wrapper.setAttribute('data-murai-flagged', 'true');
    wrapper.setAttribute('data-murai-confidence', analysis.confidence);
    wrapper.setAttribute('data-murai-reason', analysis.reason || 'Inappropriate content detected');
    wrapper.setAttribute('data-murai-original', contextInfo.fullText);

    const fullText = contextInfo.fullText;
    const beforeContext = fullText.substring(0, contextInfo.contextStart);
    const flaggedContext = fullText.substring(contextInfo.contextStart, contextInfo.contextEnd);
    const afterContext = fullText.substring(contextInfo.contextEnd);

    // Apply flagging style to the ENTIRE CONTEXT (±5 words)
    const flaggedSpan = this.createFlaggedSpan(flaggedContext, analysis);

    // Assemble the content: before + FLAGGED CONTEXT + after
    if (beforeContext) wrapper.appendChild(document.createTextNode(beforeContext));
    wrapper.appendChild(flaggedSpan);
    if (afterContext) wrapper.appendChild(document.createTextNode(afterContext));

    return wrapper;
  }

  createFlaggedSpan(contextText, analysis) {
    const span = document.createElement('span');
    span.className = 'murai-flagged-content';
    span.setAttribute('data-murai-original', contextText);

    // Apply style based on user preference to FULL CONTEXT
    switch (this.settings.flagStyle) {
      case 'blur':
        span.style.filter = `blur(${this.settings.blurAmount}px)`;
        span.style.cursor = 'pointer';
        span.textContent = contextText;
        break;

      case 'asterisk':
        // Replace the entire context with asterisks
        span.textContent = '*'.repeat(contextText.length);
        span.style.color = this.settings.highlightColor;
        break;

      case 'highlight':
      default:
        span.style.backgroundColor = this.settings.highlightColor;
        span.style.color = 'white';
        span.style.padding = '2px 4px';
        span.style.borderRadius = '3px';
        span.textContent = contextText;
        break;
    }

    // Add hover tooltip
    this.addTooltip(span, analysis);

    return span;
  }

  addTooltip(element, analysis) {
    element.addEventListener('mouseenter', (e) => {
      const tooltip = this.createTooltip(analysis);
      document.body.appendChild(tooltip);

      const rect = element.getBoundingClientRect();
      tooltip.style.left = rect.left + 'px';
      tooltip.style.top = (rect.bottom + 5) + 'px';
    });

    element.addEventListener('mouseleave', () => {
      const tooltip = document.querySelector('.murai-tooltip');
      if (tooltip) tooltip.remove();
    });
  }

  createTooltip(analysis) {
    const tooltip = document.createElement('div');
    tooltip.className = 'murai-tooltip';
    tooltip.style.cssText = `
      position: fixed;
      background: #333;
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
      z-index: 10000;
      max-width: 200px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    `;

    tooltip.innerHTML = `
      <div>ℹ️ Confidence: ${(analysis.confidence * 100).toFixed(1)}%</div>
      <div>🚩 Reason: ${analysis.reason}</div>
      <div style="margin-top: 4px; font-size: 10px; opacity: 0.8;">
        Click to report • Right-click to dismiss
      </div>
    `;

    return tooltip;
  }

  setupMutationObserver() {
    this.observer = new MutationObserver((mutations) => {
      const newTextNodes = [];
      let hasTextChanges = false;

      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE) {
              newTextNodes.push(node);
            } else if (node.nodeType === Node.ELEMENT_NODE) {
              const textNodes = this.getAllTextNodes(node);
              newTextNodes.push(...textNodes);
            }
          });
        } else if (mutation.type === 'characterData') {
          // Handle text content changes (important for Reddit/Twitter)
          if (mutation.target.textContent.trim()) {
            newTextNodes.push(mutation.target);
            hasTextChanges = true;
          }
        } else if (mutation.type === 'attributes') {
          // Handle attribute changes that might reveal content
          const element = mutation.target;
          if (element.textContent && element.textContent.trim()) {
            const textNodes = this.getAllTextNodes(element);
            newTextNodes.push(...textNodes);
          }
        }
      });

      if (newTextNodes.length > 0 || hasTextChanges) {
        console.log(`🔍 Processing ${newTextNodes.length} new text nodes (changes: ${hasTextChanges})`);
        // Process new content with a small delay
        setTimeout(() => {
          this.processBatchedTextNodes(newTextNodes);
        }, 100);

        // For text changes, also do a broader scan after a delay
        if (hasTextChanges) {
          setTimeout(() => {
            console.log('🔄 Performing broader scan due to text changes');
            this.performFullDOMScan();
          }, 1000);
        }
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'hidden', 'data-*']
    });

    console.log('👁️ Enhanced mutation observer active for dynamic content');
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch (message.type) {
        case 'SETTINGS_UPDATED':
          this.handleSettingsUpdate(message.settings);
          sendResponse({ success: true });
          break;

        case 'TOGGLE_PROTECTION':
          this.toggleDetection();
          sendResponse({ success: true, isActive: this.isActive });
          break;

        case 'RESCAN_PAGE':
          this.rescanPage();
          sendResponse({ success: true });
          break;

        case 'GET_STATS':
          sendResponse({
            flaggedCount: this.flaggedElements.size,
            isActive: this.isActive,
            cacheSize: this.cache.size,
            processedNodes: this.processedNodes ? 'WeakSet' : 0
          });
          break;

        default:
          sendResponse({ success: false, error: 'Unknown message type' });
      }
    });
  }

  async handleSettingsUpdate(newSettings) {
    console.log('🔄 Settings updated, reloading...');

    await this.loadSettings();

    // Reinitialize services with new settings
    this.initializeServices();

    // Restart detection if enabled
    if (this.settings.enabled && !this.isActive) {
      await this.startDetection();
    } else if (!this.settings.enabled && this.isActive) {
      this.stopDetection();
    }

    console.log('✅ Settings update complete');
  }

  toggleDetection() {
    if (this.isActive) {
      this.stopDetection();
    } else {
      this.startDetection();
    }
  }

  stopDetection() {
    if (!this.isActive) return;

    console.log('🛑 Stopping content detection...');

    // Stop mutation observer
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    // Clear all flags
    this.clearAllFlags();

    // Also disable instant protection
    if (window.muraiInstantProtection && window.muraiInstantProtection.cleanup) {
      console.log('🛑 Disabling instant protection...');
      window.muraiInstantProtection.cleanup();
    }

    this.isActive = false;
    console.log('✅ Content detection stopped completely');
  }

  async rescanPage() {
    if (!this.isActive) return;

    console.log('🔄 Rescanning page content...');

    // Clear existing flags and processed nodes
    this.clearAllFlags();
    this.processedNodes = new WeakSet();

    // Rescan all content
    await this.performFullDOMScan();

    console.log('✅ Page rescan complete');
  }

  clearAllFlags() {
    console.log('🧹 Clearing all flagged content...');

    this.flaggedElements.forEach((element) => {
      try {
        if (element.parentNode) {
          // Restore original text
          const original = element.getAttribute('data-murai-original');
          if (original) {
            const textNode = document.createTextNode(original);
            element.parentNode.replaceChild(textNode, element);
          }
        }
      } catch (error) {
        console.error('Error clearing flag:', error);
      }
    });

    this.flaggedElements.clear();

    // Remove any remaining tooltips
    document.querySelectorAll('.murai-tooltip').forEach(tooltip => tooltip.remove());

    console.log('🧹 All flags cleared');
  }

  normalizeText(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  isWhitelisted(url) {
    if (!this.settings.whitelistWebsites?.length) return false;

    try {
      const hostname = new URL(url).hostname;
      return this.settings.whitelistWebsites.some(domain =>
        hostname.includes(domain) || domain.includes(hostname)
      );
    } catch (error) {
      return false;
    }
  }

  /**
   * Handle handover from instant protection system
   */
  handleInstantProtectionHandover() {
    if (!window.muraiInstantProtection || this.instantProtectionHandover) {
      return;
    }

    console.log('🔄 MURAi: Taking over from instant protection system...');

    try {
      // Get elements that were instantly hidden
      const instantlyHidden = document.querySelectorAll('[data-murai-instant]');
      console.log(`🔄 MURAi: Found ${instantlyHidden.length} instantly protected elements`);

      // Process each instantly hidden element with full detection
      instantlyHidden.forEach(async (element) => {
        const originalText = element.getAttribute('data-murai-original-text');
        if (originalText) {
          // Add to flagged elements set
          this.flaggedElements.add(element);

          // Mark as processed by main system
          element.setAttribute('data-murai-processed', 'true');
          element.setAttribute('data-murai-reason', 'Instant protection → Full analysis');

          // Keep the protection but update styling to main system
          element.classList.remove('murai-instant-hidden');
          element.classList.add('murai-flagged');
          element.setAttribute('data-murai-instant', 'upgraded');
        }
      });

      // Clean up instant protection system
      if (window.muraiInstantProtection.cleanup) {
        window.muraiInstantProtection.cleanup();
      }

      this.instantProtectionHandover = true;
      console.log('✅ MURAi: Instant protection handover complete');

    } catch (error) {
      console.error('❌ MURAi: Error during instant protection handover:', error);
    }
  }

  /**
   * Clear all flags including instant protection
   */
  clearAllFlags() {
    console.log('🧹 MURAi: Clearing all flags...');

    // Clear instant protection if still active
    if (window.muraiInstantProtection && window.muraiInstantProtection.unhideAll) {
      window.muraiInstantProtection.unhideAll();
    }

    // Clear main system flags
    this.flaggedElements.forEach(element => {
      if (element && element.parentNode) {
        element.classList.remove('murai-flagged', 'murai-instant-hidden');
        element.removeAttribute('data-murai-flagged');
        element.removeAttribute('data-murai-processed');
        element.removeAttribute('data-murai-instant');
        element.removeAttribute('data-murai-original-text');
        element.removeAttribute('data-murai-reason');
        element.style.filter = '';
        element.style.background = '';
      }
    });

    this.flaggedElements.clear();
    console.log('✅ MURAi: All flags cleared');
  }

  /**
   * Force rescan the entire page (useful for testing and dynamic sites)
   */
  async rescanPage() {
    console.log('🔄 MURAi: Force rescanning entire page...');

    try {
      // Clear processed nodes to allow re-processing
      this.processedNodes = new WeakSet();

      // Perform full DOM scan
      await this.performFullDOMScan();

      console.log('✅ MURAi: Page rescan completed');
      return true;
    } catch (error) {
      console.error('❌ MURAi: Error during page rescan:', error);
      return false;
    }
  }

  /**
   * Submit detection data to server for persistent storage
   */
  async submitDetectionToServer(contextInfo, analysis) {
    try {
      // Check if user is authenticated (has token)
      const result = await chrome.storage.sync.get(['token', 'isLoggedIn']);
      if (!result.token || !result.isLoggedIn) {
        console.log('🔒 User not authenticated, skipping server submission');
        return;
      }

      // Extract detected term from the match
      const detectedTerm = contextInfo.originalMatch?.word || contextInfo.match?.word || 'unknown';

      // Prepare flagged content data in the format expected by the server
      const flaggedContentData = {
        language: this.settings.language === 'Both' ? 'Mixed' : this.settings.language || 'Mixed',
        detectedWord: detectedTerm,
        context: contextInfo.contextText || contextInfo.fullText,
        sentiment: 'negative', // Default for flagged content
        confidenceScore: analysis.confidence || 0.7,
        sourceUrl: window.location.href,
        detectionMethod: this.settings.detectionMode || 'hybrid',
        aiModel: 'roberta-v1',
        processingTime: Date.now() - (this.detectionStartTime || Date.now()),
        severity: analysis.confidence >= 0.8 ? 'high' : analysis.confidence >= 0.6 ? 'medium' : 'low'
      };

      // Send to background script for API request
      chrome.runtime.sendMessage({
        type: 'API_REQUEST',
        url: 'http://localhost:5000/api/flagged-content',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${result.token}`,
          'X-Extension-Version': chrome.runtime.getManifest()?.version || '1.0.0'
        },
        body: JSON.stringify(flaggedContentData)
      }, (response) => {
        if (response?.success) {
          console.log('✅ Flagged content submitted to server successfully:', response.data?._id);
        } else {
          console.warn('⚠️ Failed to submit flagged content to server:', response?.error);
        }
      });

    } catch (error) {
      console.error('❌ Error submitting detection to server:', error);
    }
  }

  /**
   * Get current detection statistics
   */
  getDetectionStats() {
    return {
      isActive: this.isActive,
      isInitialized: this.isInitialized,
      flaggedElements: this.flaggedElements.size,
      cacheSize: this.cache.size,
      settings: this.settings,
      hasInstantProtection: !!window.muraiInstantProtection,
      instantProtectionCount: window.muraiInstantProtection ? window.muraiInstantProtection.getHiddenCount() : 0
    };
  }
}

/**
 * Optimized Bad Word Dictionary with Hash Set for O(1) lookups
 */
class OptimizedBadWordDictionary {
  constructor(settings) {
    this.settings = settings;
    this.dictionary = new Set(); // Hash set for O(1) lookups
    this.buildOptimizedDictionary();
    console.log(`📚 Optimized dictionary loaded with ${this.dictionary.size} terms`);
  }

  buildOptimizedDictionary() {
    // English bad words (expanded set)
    const englishWords = [
      'damn', 'hell', 'shit', 'fuck', 'bitch', 'ass', 'bastard', 'crap',
      'piss', 'whore', 'slut', 'dickhead', 'asshole', 'motherfucker',
      'bullshit', 'dumbass', 'jackass', 'smartass', 'badass'
    ];

    // Tagalog bad words (expanded set)
    const tagalogWords = [
      'putang', 'gago', 'tanga', 'bobo', 'ulol', 'tarantado', 'kingina',
      'puta', 'tangina', 'pakyu', 'leche', 'peste', 'hudas', 'buwisit',
      'hayop', 'animal', 'walang', 'hiya', 'putangina'
    ];

    // Add words based on language setting
    if (this.settings.language === 'English' || this.settings.language === 'Mixed') {
      englishWords.forEach(word => {
        this.dictionary.add(word.toLowerCase());
        // Add common variations
        this.addVariations(word.toLowerCase());
      });
    }

    if (this.settings.language === 'Tagalog' || this.settings.language === 'Mixed') {
      tagalogWords.forEach(word => {
        this.dictionary.add(word.toLowerCase());
        // Add common variations
        this.addVariations(word.toLowerCase());
      });
    }

    // Add custom dictionary words
    if (this.settings.dictionary) {
      this.settings.dictionary.forEach(word => {
        this.dictionary.add(word.toLowerCase());
        this.addVariations(word.toLowerCase());
      });
    }
  }

  addVariations(word) {
    // Leetspeak variations
    const leetMap = {
      'a': ['@', '4'], 'e': ['3'], 'i': ['1', '!'], 'o': ['0'],
      's': ['5', '$'], 't': ['7'], 'l': ['1']
    };

    let variations = [word];

    for (const [letter, substitutes] of Object.entries(leetMap)) {
      const newVariations = [];
      for (const variant of variations) {
        for (const substitute of substitutes) {
          newVariations.push(variant.replace(new RegExp(letter, 'g'), substitute));
        }
      }
      variations.push(...newVariations);
    }

    // Add all variations to dictionary
    variations.forEach(variation => this.dictionary.add(variation));
  }

  scanText(normalizedText, originalText) {
    const matches = [];
    const words = normalizedText.split(/\s+/);

    for (let i = 0; i < words.length; i++) {
      const word = words[i];

      // O(1) hash set lookup
      if (this.dictionary.has(word)) {
        const position = this.findWordPosition(originalText, word, i);
        matches.push({
          word: word,
          start: position,
          end: position + word.length,
          type: 'exact'
        });
      }
    }

    return matches;
  }

  findWordPosition(text, word, wordIndex) {
    const words = text.split(/\s+/);
    let position = 0;

    for (let i = 0; i < wordIndex && i < words.length; i++) {
      position = text.indexOf(words[i], position) + words[i].length;
      // Skip whitespace
      while (position < text.length && /\s/.test(text[position])) {
        position++;
      }
    }

    return text.indexOf(words[wordIndex], position);
  }
}

/**
 * RoBERTa API Service with multiple endpoints and fallback system
 */
class RoBERTaService {
  constructor() {
    this.endpoints = [
      {
        url: 'https://ynoope-murai.hf.space/predict',
        name: 'MURAi Predict',
        format: 'predict'
      }
    ];
    this.currentEndpointIndex = 0;
    this.maxBatchSize = 10;
    this.timeout = 5000; // 5 second timeout
    this.fallbackMode = false;
  }

  async analyzeBatch(phrases, lang) {
    // If in fallback mode, skip API calls
    if (this.fallbackMode) {
      console.log('⚠️ Using fallback mode - skipping API calls');
      return this.generateFallbackResults(phrases);
    }

    try {
      console.log(`🤖 Sending ${phrases.length} phrases to AI analysis...`);

      // Split into smaller batches if needed
      const batches = this.splitIntoBatches(phrases, this.maxBatchSize);
      const allResults = [];

      for (const batch of batches) {
        try {
          const results = await this.processBatchWithFallback(batch, lang);
          allResults.push(...results);
        } catch (batchError) {
          console.warn('⚠️ Batch processing failed, using fallback:', batchError);
          const fallbackResults = this.generateFallbackResults(batch);
          allResults.push(...fallbackResults);
        }
      }

      return allResults;

    } catch (error) {
      console.error('❌ AI analysis error:', error);
      return this.generateFallbackResults(phrases);
    }
  }

  async processBatchWithFallback(phrases, lang) {
    // Try each endpoint in order
    for (let i = 0; i < this.endpoints.length; i++) {
      const endpointIndex = (this.currentEndpointIndex + i) % this.endpoints.length;
      const endpoint = this.endpoints[endpointIndex];

      try {
        console.log(`🔄 Trying ${endpoint.name}...`);
        const results = await this.processBatch(phrases, endpoint, lang);

        // Success! Update current endpoint
        this.currentEndpointIndex = endpointIndex;
        console.log(`✅ ${endpoint.name} successful`);
        return results;

      } catch (error) {
        console.warn(`⚠️ ${endpoint.name} failed:`, error.message);
        continue;
      }
    }

    // All endpoints failed, enable fallback mode temporarily
    console.warn('⚠️ All API endpoints failed, enabling fallback mode');
    this.fallbackMode = true;

    // Re-enable API attempts after 5 minutes
    setTimeout(() => {
      this.fallbackMode = false;
      console.log('🔄 Re-enabling API attempts');
    }, 300000);

    throw new Error('All API endpoints failed');
  }

  generateFallbackResults(phrases) {
    return phrases.map(phrase => {
      // Simple heuristic-based confidence scoring
      const lowerPhrase = phrase.toLowerCase();
      let confidence = 0.6; // Base confidence for dictionary matches

      // Increase confidence for multiple bad words
      const badWordCount = (lowerPhrase.match(/\b(damn|hell|shit|fuck|bitch|gago|tanga|puta)\b/g) || []).length;
      confidence += badWordCount * 0.1;

      // Increase confidence for explicit patterns
      if (lowerPhrase.includes('fucking') || lowerPhrase.includes('putang')) {
        confidence += 0.2;
      }

      // Cap at 0.9
      confidence = Math.min(confidence, 0.9);

      return {
        is_toxic: true,
        confidence: confidence,
        reason: 'Dictionary-based detection (fallback)'
      };
    });
  }

  async processBatch(phrases, endpoint, lang) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      if (endpoint.format === 'predict') {
        const headers = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(endpoint.headers || {})
        };

        const results = await Promise.all(
          phrases.map(async (text) => {
            const resp = await fetch(endpoint.url, {
              method: 'POST',
              headers,
              body: JSON.stringify({ text, lang: lang || 'fil' }),
              signal: controller.signal
            });
            if (!resp.ok) {
              throw new Error(`${endpoint.name} failed: ${resp.status} ${resp.statusText}`);
            }
            const data = await resp.json();
            return {
              is_toxic: !!data.is_toxic,
              confidence: typeof data.confidence === 'number' ? data.confidence : 0,
              probabilities: data.probabilities,
              reason: 'AI verification'
            };
          })
        );
        clearTimeout(timeoutId);
        console.log(`✅ ${endpoint.name} responses received`);
        return results;
      }

      // Legacy formats (kept for compatibility)
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...endpoint.headers
      };

      let body;
      if (endpoint.format === 'huggingface') {
        body = JSON.stringify({ inputs: phrases });
      } else {
        body = JSON.stringify({ texts: phrases, model: 'roberta-base' });
      }

      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers,
        body,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`${endpoint.name} failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ ${endpoint.name} response received`);

      if (endpoint.format === 'huggingface') {
        return this.normalizeHuggingFaceResponse(data, phrases);
      } else {
        return data.results || [];
      }

    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error(`${endpoint.name} timeout`);
      }
      throw error;
    }
  }

  normalizeHuggingFaceResponse(data, phrases) {
    // Convert HuggingFace format to our format
    if (Array.isArray(data)) {
      return data.map((result, index) => {
        const toxicScore = result.find(r => r.label === 'TOXIC')?.score || 0;
        return {
          confidence: toxicScore,
          reason: `HuggingFace analysis (${(toxicScore * 100).toFixed(1)}% toxic)`
        };
      });
    }

    // Fallback for unexpected format
    return phrases.map(() => ({
      confidence: 0.7,
      reason: 'HuggingFace analysis (format unknown)'
    }));
  }

  splitIntoBatches(array, batchSize) {
    const batches = [];
    for (let i = 0; i < array.length; i += batchSize) {
      batches.push(array.slice(i, i + batchSize));
    }
    return batches;
  }
}

// Check if we should run on this page
function shouldRunOnPage() {
  const url = window.location.href;
  const hostname = window.location.hostname;

  // Don't run on browser internal pages
  if (url.startsWith('chrome://') ||
      url.startsWith('chrome-extension://') ||
      url.startsWith('moz-extension://') ||
      url.startsWith('about:')) {
    return false;
  }

  return true;
}

// Initialize the content script
console.log('📦 MURAi: Loading advanced content detection system...');

// Safe initialization with error handling
function safeInitialize() {
  try {
    // Check if we should run on this page
    if (!shouldRunOnPage()) {
      console.log('🚫 MURAi: Skipping initialization on this page');
      return;
    }

    const contentScript = new MuraiContentScript();
    window.muraiContentScript = contentScript;
    console.log('✅ MURAi: Advanced content detection system loaded successfully');
  } catch (error) {
    console.error('❌ MURAi: Critical initialization error:', error);
  }
}

// Initialize with delay to ensure DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', safeInitialize);
} else {
  setTimeout(safeInitialize, 100);
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  try {
    if (window.muraiContentScript) {
      window.muraiContentScript.stopDetection();
    }
  } catch (error) {
    console.error('❌ MURAi: Cleanup error:', error);
  }
});

console.log('📦 MURAi: Advanced content detection script loaded');
