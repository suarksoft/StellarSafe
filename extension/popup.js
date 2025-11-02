// Popup Script for StellarSafe Extension

document.addEventListener('DOMContentLoaded', async () => {
  // Load settings
  loadSettings();
  
  // Load stats
  loadStats();
  
  // Setup toggle listeners
  setupToggles();
});

/**
 * Load extension settings
 */
async function loadSettings() {
  try {
    const settings = await chrome.storage.sync.get(['enabled', 'showWarnings', 'blockHighRisk']);
    
    document.getElementById('toggle-enabled').checked = settings.enabled !== false;
    document.getElementById('toggle-warnings').checked = settings.showWarnings !== false;
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
}

/**
 * Load asset statistics
 */
async function loadStats() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_STATS' });
    
    if (response.success) {
      document.getElementById('verified-count').textContent = response.stats.verifiedCount || 0;
      document.getElementById('blacklisted-count').textContent = response.stats.blacklistedCount || 0;
    }
  } catch (error) {
    console.error('Failed to load stats:', error);
    document.getElementById('verified-count').textContent = '?';
    document.getElementById('blacklisted-count').textContent = '?';
  }
}

/**
 * Setup toggle event listeners
 */
function setupToggles() {
  document.getElementById('toggle-enabled').addEventListener('change', async (e) => {
    try {
      await chrome.storage.sync.set({ enabled: e.target.checked });
      console.log('Protection', e.target.checked ? 'enabled' : 'disabled');
    } catch (error) {
      console.error('Failed to save setting:', error);
    }
  });

  document.getElementById('toggle-warnings').addEventListener('change', async (e) => {
    try {
      await chrome.storage.sync.set({ showWarnings: e.target.checked });
      console.log('Warnings', e.target.checked ? 'enabled' : 'disabled');
    } catch (error) {
      console.error('Failed to save setting:', error);
    }
  });
}
