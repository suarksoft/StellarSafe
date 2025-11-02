// Injected Script - Runs in page context to intercept Freighter
// This script intercepts signTransaction calls and triggers analysis

(function() {
  'use strict';

  console.log('StellarSafe injected script loaded');

  // Store original Freighter methods
  let originalFreighter = null;
  let requestCounter = 0;
  const pendingRequests = new Map();

  // Listen for analysis results
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    
    const { type, requestId, analysis, error } = event.data;
    
    if (type === 'STELLARSAFE_ANALYSIS_RESULT') {
      const pending = pendingRequests.get(requestId);
      if (pending) {
        pendingRequests.delete(requestId);
        if (error) {
          pending.reject(new Error(error));
        } else {
          pending.resolve(analysis);
        }
      }
    }
  });

  /**
   * Request transaction analysis
   */
  function analyzeTransaction(xdr) {
    return new Promise((resolve, reject) => {
      const requestId = `req_${++requestCounter}`;
      pendingRequests.set(requestId, { resolve, reject });

      // Send to content script
      window.postMessage(
        {
          type: 'STELLARSAFE_ANALYZE_TRANSACTION',
          data: { xdr, requestId },
        },
        '*'
      );

      // Timeout after 10 seconds
      setTimeout(() => {
        if (pendingRequests.has(requestId)) {
          pendingRequests.delete(requestId);
          reject(new Error('Analysis timeout'));
        }
      }, 10000);
    });
  }

  /**
   * Show warning modal
   */
  function showWarningModal(analysis) {
    return new Promise((resolve) => {
      // Create modal overlay
      const overlay = document.createElement('div');
      overlay.id = 'stellarsafe-modal-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.75);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;

      // Create modal
      const modal = document.createElement('div');
      modal.style.cssText = `
        background: white;
        border-radius: 20px;
        padding: 32px;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
      `;

      const riskColors = {
        SAFE: { bg: '#dcfce7', text: '#166534', border: '#86efac' },
        LOW: { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
        MEDIUM: { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
        HIGH: { bg: '#fed7aa', text: '#9a3412', border: '#fb923c' },
        CRITICAL: { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
      };

      const riskLevel = analysis.overallRisk?.level || 'MEDIUM';
      const riskScore = analysis.overallRisk?.score || 0;
      const colors = riskColors[riskLevel];

      modal.innerHTML = `
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="width: 64px; height: 64px; margin: 0 auto 16px; background: #f3f4f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px;">
            🛡️
          </div>
          <h2 style="font-size: 24px; font-weight: 700; margin: 0 0 8px 0; color: #111827;">
            StellarSafe Transaction Analysis
          </h2>
          <p style="color: #6b7280; margin: 0;">
            We've analyzed this transaction for potential security risks
          </p>
        </div>

        <div style="background: ${colors.bg}; border: 2px solid ${colors.border}; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 12px;">
            <span style="font-size: 18px; font-weight: 700; color: ${colors.text}; text-transform: uppercase;">
              ${riskLevel} RISK
            </span>
            <span style="color: ${colors.text}; font-size: 14px;">
              Score: ${riskScore}/100
            </span>
          </div>
        </div>

        ${analysis.threats && analysis.threats.length > 0 ? `
          <div style="margin-bottom: 24px;">
            <h3 style="font-size: 16px; font-weight: 600; margin: 0 0 12px 0; color: #111827;">
              ⚠️ Detected Threats (${analysis.threats.length})
            </h3>
            <div style="max-height: 200px; overflow-y: auto;">
              ${analysis.threats.map(threat => `
                <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px; margin-bottom: 8px;">
                  <div style="font-weight: 600; color: #991b1b; margin-bottom: 4px;">
                    ${threat.title || threat.description}
                  </div>
                  <div style="font-size: 13px; color: #7f1d1d;">
                    ${threat.explanation || ''}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${analysis.operations && analysis.operations.length > 0 ? `
          <div style="margin-bottom: 24px;">
            <h3 style="font-size: 16px; font-weight: 600; margin: 0 0 12px 0; color: #111827;">
              Operations (${analysis.operations.length})
            </h3>
            <div style="font-size: 13px; color: #6b7280; max-height: 150px; overflow-y: auto;">
              ${analysis.operations.map((op, i) => `
                <div style="padding: 8px; background: #f9fafb; border-radius: 6px; margin-bottom: 4px;">
                  ${i + 1}. ${op.type}
                  ${op.amount ? ` - ${op.amount} ${op.asset?.code || ''}` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <div style="display: flex; gap: 12px; margin-top: 24px;">
          <button id="stellarsafe-cancel" style="
            flex: 1;
            padding: 12px 24px;
            background: #ef4444;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
          ">
            ❌ Cancel Transaction
          </button>
          <button id="stellarsafe-proceed" style="
            flex: 1;
            padding: 12px 24px;
            background: #10b981;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
          ">
            ✅ Proceed Anyway
          </button>
        </div>

        <div style="margin-top: 16px; text-align: center; font-size: 12px; color: #9ca3af;">
          Powered by StellarSafe
        </div>
      `;

      overlay.appendChild(modal);
      document.body.appendChild(overlay);

      // Add hover effects
      const cancelBtn = modal.querySelector('#stellarsafe-cancel');
      const proceedBtn = modal.querySelector('#stellarsafe-proceed');

      cancelBtn.addEventListener('mouseenter', () => {
        cancelBtn.style.background = '#dc2626';
      });
      cancelBtn.addEventListener('mouseleave', () => {
        cancelBtn.style.background = '#ef4444';
      });

      proceedBtn.addEventListener('mouseenter', () => {
        proceedBtn.style.background = '#059669';
      });
      proceedBtn.addEventListener('mouseleave', () => {
        proceedBtn.style.background = '#10b981';
      });

      // Handle button clicks
      cancelBtn.addEventListener('click', () => {
        overlay.remove();
        resolve(false);
      });

      proceedBtn.addEventListener('click', () => {
        overlay.remove();
        resolve(true);
      });
    });
  }

  /**
   * Intercept Freighter
   */
  function interceptFreighter() {
    // Wait for Freighter to be available
    const checkFreighter = setInterval(() => {
      if (window.freighterApi) {
        clearInterval(checkFreighter);
        
        console.log('StellarSafe: Freighter detected, installing interceptor');
        
        // Store original method
        originalFreighter = window.freighterApi.signTransaction;
        
        // Replace with intercepted version
        window.freighterApi.signTransaction = async function(xdr, opts) {
          console.log('StellarSafe: Intercepted signTransaction call');
          
          try {
            // Analyze transaction
            const analysis = await analyzeTransaction(xdr);
            
            // Show warning modal
            const shouldProceed = await showWarningModal(analysis);
            
            if (!shouldProceed) {
              throw new Error('Transaction cancelled by user via StellarSafe');
            }
            
            // Proceed with original signing
            return await originalFreighter.call(this, xdr, opts);
          } catch (error) {
            console.error('StellarSafe error:', error);
            
            // If analysis fails, still allow signing but warn user
            if (error.message.includes('cancelled')) {
              throw error;
            }
            
            // For other errors, proceed with original signing
            console.warn('StellarSafe: Analysis failed, proceeding with transaction');
            return await originalFreighter.call(this, xdr, opts);
          }
        };
        
        console.log('StellarSafe: Freighter interceptor installed successfully');
      }
    }, 100);

    // Stop checking after 10 seconds
    setTimeout(() => {
      clearInterval(checkFreighter);
      if (!originalFreighter) {
        console.log('StellarSafe: Freighter not detected');
      }
    }, 10000);
  }

  // Start intercepting
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', interceptFreighter);
  } else {
    interceptFreighter();
  }
})();
