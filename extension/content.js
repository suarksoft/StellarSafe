// Content Script - Injects StellarSafe into web pages
// Intercepts Freighter wallet calls and analyzes transactions

console.log('StellarSafe content script loaded');

// Inject the main interceptor script into the page context
const script = document.createElement('script');
script.src = chrome.runtime.getURL('injected.js');
script.onload = function() {
  this.remove();
};
(document.head || document.documentElement).appendChild(script);

// Listen for messages from injected script
window.addEventListener('message', async (event) => {
  // Only accept messages from same window
  if (event.source !== window) return;

  const { type, data } = event.data;

  if (type === 'STELLARSAFE_ANALYZE_TRANSACTION') {
    console.log('StellarSafe: Analyzing transaction...', data);

    try {
      // Send to background script for API call
      chrome.runtime.sendMessage(
        {
          type: 'ANALYZE_TRANSACTION',
          xdr: data.xdr,
        },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error('StellarSafe error:', chrome.runtime.lastError);
            window.postMessage(
              {
                type: 'STELLARSAFE_ANALYSIS_RESULT',
                requestId: data.requestId,
                error: chrome.runtime.lastError.message,
              },
              '*'
            );
            return;
          }

          if (response.success) {
            console.log('StellarSafe: Analysis complete', response.analysis);
            
            // Send result back to injected script
            window.postMessage(
              {
                type: 'STELLARSAFE_ANALYSIS_RESULT',
                requestId: data.requestId,
                analysis: response.analysis,
              },
              '*'
            );
          } else {
            console.error('StellarSafe analysis failed:', response.error);
            window.postMessage(
              {
                type: 'STELLARSAFE_ANALYSIS_RESULT',
                requestId: data.requestId,
                error: response.error,
              },
              '*'
            );
          }
        }
      );
    } catch (error) {
      console.error('StellarSafe error:', error);
      window.postMessage(
        {
          type: 'STELLARSAFE_ANALYSIS_RESULT',
          requestId: data.requestId,
          error: error.message,
        },
        '*'
      );
    }
  }
});

console.log('StellarSafe: Ready to protect your transactions');
