import fetch from 'node-fetch';
import { ContractInfo, VerificationResponse } from './types';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'https://stellar-safe-liard.vercel.app') {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  /**
   * Submit verification data to StellarSafe API
   */
  async submitVerification(
    code: string,
    contractInfo: ContractInfo
  ): Promise<VerificationResponse> {
    try {
      const url = `${this.baseUrl}/api/verify/submit`;
      
      console.log(`📡 Submitting verification to ${url}...\n`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Verification-Code': code,
        },
        body: JSON.stringify(contractInfo),
      });

      const data = await response.json() as VerificationResponse;

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        // Check for common network errors
        if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
          throw new Error(
            `Cannot connect to StellarSafe API at ${this.baseUrl}.\n` +
            'Please check:\n' +
            '  - Your internet connection\n' +
            '  - The API URL (use --api-url to specify a custom URL)\n' +
            '  - If running locally, ensure the dev server is running'
          );
        }
        throw error;
      }
      throw new Error('Unknown error occurred while submitting verification');
    }
  }

  /**
   * Check verification status
   */
  async checkStatus(code: string): Promise<any> {
    try {
      const url = `${this.baseUrl}/api/verify/status/${code}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      throw new Error(`Failed to check status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

