import * as StellarSdk from '@stellar/stellar-sdk';

export class StellarClient {
  private server: StellarSdk.Horizon.Server;
  public network: string;
  public networkPassphrase: string;

  constructor(isTestnet: boolean = true) {
    const horizonUrl = isTestnet
      ? 'https://horizon-testnet.stellar.org'
      : 'https://horizon.stellar.org';
    
    this.server = new StellarSdk.Horizon.Server(horizonUrl);
    this.network = isTestnet ? 'testnet' : 'mainnet';
    this.networkPassphrase = isTestnet ? StellarSdk.Networks.TESTNET : StellarSdk.Networks.PUBLIC;
  }

  /**
   * Load account from Stellar network
   */
  async loadAccount(accountId: string) {
    try {
      const account = await this.server.loadAccount(accountId);
      return account;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to load account ${accountId}: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get asset information
   */
  async getAssetInfo(assetCode: string, issuerAddress: string) {
    try {
      const assets = await this.server
        .assets()
        .forCode(assetCode)
        .forIssuer(issuerAddress)
        .limit(1)
        .call();

      if (assets.records.length === 0) {
        throw new Error('Asset not found');
      }

      return assets.records[0];
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get asset: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get account transactions
   */
  async getTransactions(accountId: string, limit: number = 10) {
    try {
      const transactions = await this.server
        .transactions()
        .forAccount(accountId)
        .limit(limit)
        .order('desc')
        .call();

      return transactions.records;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get transactions: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get account operations
   */
  async getOperations(accountId: string, limit: number = 50) {
    try {
      const operations = await this.server
        .operations()
        .forAccount(accountId)
        .limit(limit)
        .order('desc')
        .call();

      return operations.records;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get operations: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Verify TOML file from home domain
   */
  async verifyToml(homeDomain: string, issuerAddress: string): Promise<boolean> {
    try {
      const tomlUrl = `https://${homeDomain}/.well-known/stellar.toml`;
      const response = await fetch(tomlUrl);
      
      if (!response.ok) {
        return false;
      }

      const tomlContent = await response.text();
      
      // Simple check: does TOML contain the issuer address?
      return tomlContent.includes(issuerAddress);
    } catch (error) {
      return false;
    }
  }

  /**
   * Calculate account age in days
   */
  async getAccountAge(accountId: string): Promise<number> {
    try {
      const transactions = await this.server
        .transactions()
        .forAccount(accountId)
        .order('asc')
        .limit(1)
        .call();

      if (transactions.records.length === 0) {
        return 0;
      }

      const createdAt = new Date(transactions.records[0].created_at);
      const now = new Date();
      const ageInMs = now.getTime() - createdAt.getTime();
      const ageInDays = Math.floor(ageInMs / (1000 * 60 * 60 * 24));

      return ageInDays;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get account payment history
   */
  async getPaymentHistory(accountId: string, limit: number = 20) {
    try {
      const payments = await this.server
        .payments()
        .forAccount(accountId)
        .limit(limit)
        .order('desc')
        .call();

      return payments.records;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get payment history: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get transaction by hash
   */
  async getTransaction(hash: string) {
    try {
      const transaction = await this.server.transactions().transaction(hash).call();
      return transaction;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get transaction: ${error.message}`);
      }
      throw error;
    }
  }
}

// Export singleton instance
export const stellarClient = new StellarClient(
  process.env.NEXT_PUBLIC_STELLAR_NETWORK === 'testnet'
);
