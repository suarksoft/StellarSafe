// Background Service Worker for StellarSafe Extension
// Handles transaction analysis requests and communicates with API

const API_BASE_URL = 'http://localhost:3000/api'; // Change to production URL

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'ANALYZE_TRANSACTION') {
    analyzeTransaction(request.xdr)
      .then(analysis => {
        sendResponse({ success: true, analysis });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep channel open for async response
  }

  if (request.type === 'ANALYZE_ASSET') {
    analyzeAsset(request.assetCode, request.issuerAddress)
      .then(analysis => {
        sendResponse({ success: true, analysis });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }

  if (request.type === 'GET_STATS') {
    getStats()
      .then(stats => {
        sendResponse({ success: true, stats });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
});

/**
 * Analyze transaction XDR
 */
async function analyzeTransaction(xdr) {
  try {
    const response = await fetch(`${API_BASE_URL}/analyze/transaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ xdr }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Analysis failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Transaction analysis failed:', error);
    throw error;
  }
}

/**
 * Analyze asset
 */
async function analyzeAsset(assetCode, issuerAddress) {
  try {
    const response = await fetch(`${API_BASE_URL}/analyze/asset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assetCode, issuerAddress }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Analysis failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Asset analysis failed:', error);
    throw error;
  }
}

/**
 * Get asset stats
 */
async function getStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/assets/stats`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    return await response.json();
  } catch (error) {
    console.error('Stats fetch failed:', error);
    return { verifiedCount: 0, blacklistedCount: 0 };
  }
}

// Log when extension is installed or updated
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('StellarSafe extension installed');
    
    // Set default settings
    chrome.storage.sync.set({
      enabled: true,
      blockHighRisk: false,
      showWarnings: true,
    });
  } else if (details.reason === 'update') {
    console.log('StellarSafe extension updated to', chrome.runtime.getManifest().version);
  }
});

// Keep service worker alive
chrome.runtime.onStartup.addListener(() => {
  console.log('StellarSafe service worker started');
});

console.log('StellarSafe background service worker loaded');
