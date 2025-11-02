import { WidgetOptions, WidgetInitOptions, RiskAnalysisResult, PartnerConfig, StellarNetwork } from './types';
import { partnerConfigs, networkConfigs } from './config';
import { StellarSafeAPI } from './api';
import './styles.css';

export class StellarSafeWidget {
  private api: StellarSafeAPI;
  private overlay: HTMLElement | null = null;
  private modal: HTMLElement | null = null;
  private config: WidgetInitOptions;
  private isInitialized = false;

  constructor() {
    // Default configuration
    this.config = {
      network: 'testnet',
      failMode: 'open',
      partnerId: 'default'
    };
    this.api = new StellarSafeAPI('testnet');
  }

  init(options: WidgetInitOptions): void {
    this.config = { ...this.config, ...options };
    this.api = new StellarSafeAPI(
      this.config.network || 'testnet',
      this.config.apiHost,
      this.config.authToken
    );
    this.isInitialized = true;
    
    // Log initialization
    const networkConfig = networkConfigs[this.config.network || 'testnet'];
    console.log(`[StellarSafe Widget] Initialized for ${networkConfig.name}`, {
      partner: this.config.partnerId,
      network: this.config.network,
      hasAuth: !!this.config.authToken,
      failMode: this.config.failMode
    });
  }

  async check(options: WidgetOptions): Promise<void> {
    try {
      // Auto-initialize if not done yet
      if (!this.isInitialized) {
        console.warn('[StellarSafe Widget] Auto-initializing with defaults');
        this.init({});
      }

      // Get partner config from initialization
      const config = this.getPartnerConfig(this.config.partnerId);
      
      // Show loading modal
      this.showModal(config, 'loading');
      
      // Perform analysis
      const result = await this.api.analyzeAddress(options.address);
      
      // Update modal with results
      this.updateModal(config, result);
      
      // Call callback
      if (options.onResult) {
        options.onResult(result);
      }

    } catch (error) {
      this.showError(this.config.partnerId, error as Error);
      if (options.onError) {
        options.onError(error as Error);
      }
    }
  }

  private getPartnerConfig(partnerId?: string): PartnerConfig {
    const baseConfig = partnerId && partnerConfigs[partnerId] 
      ? partnerConfigs[partnerId] 
      : partnerConfigs.default;
    
    // Apply custom config from init options if available
    return { ...baseConfig, ...this.config.customConfig };
  }

  private showModal(config: PartnerConfig, state: 'loading' | 'result'): void {
    // Create overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'stellarsafe-overlay';
    
    // Create modal
    this.modal = document.createElement('div');
    this.modal.className = `stellarsafe-modal stellarsafe-${config.position || 'center'}`;
    
    // Set CSS variables for theming
    this.modal.style.setProperty('--primary-color', config.colors.primary);
    this.modal.style.setProperty('--danger-color', config.colors.danger);
    this.modal.style.setProperty('--success-color', config.colors.success);
    this.modal.style.setProperty('--warning-color', config.colors.warning);

    if (state === 'loading') {
      this.modal.innerHTML = this.createLoadingHTML(config);
    }

    this.overlay.appendChild(this.modal);
    document.body.appendChild(this.overlay);

    // Add animation class if enabled
    if (config.animation) {
      setTimeout(() => {
        this.modal?.classList.add('stellarsafe-animate-in');
      }, 10);
    }

    // Close on overlay click
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.close();
      }
    });
  }

  private updateModal(config: PartnerConfig, result: RiskAnalysisResult): void {
    if (!this.modal) return;

    this.modal.innerHTML = this.createResultHTML(config, result);
  }

  private createLoadingHTML(config: PartnerConfig): string {
    const networkConfig = networkConfigs[this.config.network || 'testnet'];
    
    return `
      <div class="stellarsafe-header">
        ${config.logo ? `<img src="${config.logo}" alt="${config.name}" class="stellarsafe-logo">` : ''}
        <h3 class="stellarsafe-title">${config.name}</h3>
        <span class="stellarsafe-network-badge stellarsafe-network-${this.config.network}">${networkConfig.name}</span>
      </div>
      <div class="stellarsafe-content">
        <div class="stellarsafe-spinner"></div>
        <p class="stellarsafe-message">${config.messages.checking}</p>
        <p class="stellarsafe-network-info">Analyzing on Stellar ${networkConfig.name}</p>
      </div>
    `;
  }

  private createResultHTML(config: PartnerConfig, result: RiskAnalysisResult): string {
    const statusClass = `stellarsafe-status-${result.riskLevel.toLowerCase()}`;
    const message = this.getStatusMessage(config, result.riskLevel);
    
    return `
      <div class="stellarsafe-header">
        ${config.logo ? `<img src="${config.logo}" alt="${config.name}" class="stellarsafe-logo">` : ''}
        <h3 class="stellarsafe-title">${config.name}</h3>
        <button class="stellarsafe-close" onclick="window.StellarSafeWidget.close()">&times;</button>
      </div>
      
      <div class="stellarsafe-content ${statusClass}">
        <div class="stellarsafe-status-icon">
          ${this.getStatusIcon(result.riskLevel)}
        </div>
        
        <p class="stellarsafe-message stellarsafe-main-message">${message}</p>
        
        <div class="stellarsafe-details">
          <div class="stellarsafe-score">
            <span class="stellarsafe-label">Trust Score:</span>
            <span class="stellarsafe-value">${result.trustScore}/100</span>
          </div>
          
          ${result.factors.stellarExpert?.verified ? `
            <div class="stellarsafe-factor stellarsafe-verified">
              ✓ Verified by ${result.factors.stellarExpert.organization || 'StellarExpert'}
            </div>
          ` : ''}
          
          ${result.factors.tomlVerification?.verified ? `
            <div class="stellarsafe-factor stellarsafe-verified">
              ✓ Domain verified: ${result.factors.tomlVerification.domain}
            </div>
          ` : ''}
        </div>
        
        <div class="stellarsafe-actions">
          ${result.riskLevel === 'DANGER' ? `
            <button class="stellarsafe-btn stellarsafe-btn-danger" onclick="window.StellarSafeWidget.close()">
              Cancel Transaction
            </button>
            <button class="stellarsafe-btn stellarsafe-btn-outline" onclick="window.StellarSafeWidget.proceedAnyway()">
              Proceed Anyway
            </button>
          ` : result.riskLevel === 'WARNING' ? `
            <button class="stellarsafe-btn stellarsafe-btn-warning" onclick="window.StellarSafeWidget.close()">
              Review Again
            </button>
            <button class="stellarsafe-btn stellarsafe-btn-primary" onclick="window.StellarSafeWidget.proceed()">
              Continue
            </button>
          ` : `
            <button class="stellarsafe-btn stellarsafe-btn-success" onclick="window.StellarSafeWidget.proceed()">
              Continue Transaction
            </button>
          `}
        </div>
      </div>
    `;
  }

  private getStatusMessage(config: PartnerConfig, riskLevel: string): string {
    switch (riskLevel) {
      case 'SAFE': return config.messages.safe;
      case 'WARNING': return config.messages.warning;
      case 'DANGER': return config.messages.danger;
      default: return config.messages.error;
    }
  }

  private getStatusIcon(riskLevel: string): string {
    switch (riskLevel) {
      case 'SAFE': return '🛡️';
      case 'WARNING': return '⚠️';
      case 'DANGER': return '🚨';
      default: return '❓';
    }
  }

  private showError(partnerId?: string, error?: Error): void {
    const config = this.getPartnerConfig(partnerId);
    if (!this.modal) {
      this.showModal(config, 'result');
    }
    
    if (this.modal) {
      this.modal.innerHTML = `
        <div class="stellarsafe-header">
          <h3 class="stellarsafe-title">${config.name}</h3>
          <button class="stellarsafe-close" onclick="window.StellarSafeWidget.close()">&times;</button>
        </div>
        <div class="stellarsafe-content stellarsafe-error">
          <p class="stellarsafe-message">${config.messages.error}</p>
          ${error ? `<p class="stellarsafe-error-details">${error.message}</p>` : ''}
          <button class="stellarsafe-btn stellarsafe-btn-primary" onclick="window.StellarSafeWidget.close()">
            Continue Without Check
          </button>
        </div>
      `;
    }
  }

  close(): void {
    if (this.overlay) {
      if (this.overlay.parentNode) {
        this.overlay.parentNode.removeChild(this.overlay);
      }
      this.overlay = null;
      this.modal = null;
    }
  }

  proceed(): void {
    this.close();
    // Trigger proceed callback if set
    const event = new CustomEvent('stellarsafe:proceed');
    window.dispatchEvent(event);
  }

  proceedAnyway(): void {
    this.close();
    // Trigger proceed anyway callback
    const event = new CustomEvent('stellarsafe:proceedAnyway');
    window.dispatchEvent(event);
  }
}

// Global instance
(window as any).StellarSafeWidget = new StellarSafeWidget();