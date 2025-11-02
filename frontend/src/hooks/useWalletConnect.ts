import { useState, useEffect, useCallback } from 'react';

export type WalletType = 'freighter' | 'albedo' | 'rabet' | 'xbull' | 'lobstr';

export interface WalletInfo {
  type: WalletType;
  name: string;
  publicKey: string;
  network: 'testnet' | 'mainnet';
}

export interface WalletConnectState {
  isConnected: boolean;
  wallet: WalletInfo | null;
  isConnecting: boolean;
  error: string | null;
}

// Freighter API types
interface FreighterApiResponse<T> {
  error?: string;
}

interface FreighterApi {
  isConnected: () => Promise<{ isConnected: boolean } & FreighterApiResponse<void>>;
  isAllowed: () => Promise<{ isAllowed: boolean } & FreighterApiResponse<void>>;
  setAllowed: () => Promise<{ isAllowed: boolean } & FreighterApiResponse<void>>;
  getAddress: () => Promise<{ address: string } & FreighterApiResponse<void>>;
  getNetwork: () => Promise<{ network: string; networkPassphrase: string } & FreighterApiResponse<void>>;
  getNetworkDetails: () => Promise<{ network: string; networkUrl: string; networkPassphrase: string; sorobanRpcUrl?: string } & FreighterApiResponse<void>>;
  signTransaction: (xdr: string, opts?: { networkPassphrase?: string; address?: string }) => Promise<{ signedTxXdr: string } & FreighterApiResponse<void>>;
  signAuthEntry: (entryXdr: string, opts?: { networkPassphrase?: string; address?: string }) => Promise<{ signedAuthEntry: string } & FreighterApiResponse<void>>;
  signMessage: (message: string, opts?: { networkPassphrase?: string; address?: string }) => Promise<{ signedMessage: string } & FreighterApiResponse<void>>;
}

declare global {
  interface Window {
    freighterApi?: FreighterApi;
    albedo?: any;
    rabet?: any;
    xBullSDK?: any;
  }
}

export const useWalletConnect = () => {
  const [state, setState] = useState<WalletConnectState>({
    isConnected: false,
    wallet: null,
    isConnecting: false,
    error: null,
  });
  const [walletsChecked, setWalletsChecked] = useState(false);

  // Wait for wallet extensions to load
  useEffect(() => {
    const checkWalletLoadingDelay = setTimeout(() => {
      setWalletsChecked(true);
    }, 500); // Give wallet extensions time to inject

    return () => clearTimeout(checkWalletLoadingDelay);
  }, []);

  const checkExistingConnection = useCallback(async () => {
    try {
      // First, check localStorage for a stored connection
      const storedWallet = localStorage.getItem('stellarsafe_wallet');
      if (storedWallet) {
        const walletInfo = JSON.parse(storedWallet);
        
        // Verify the wallet is still accessible
        if (walletInfo.type === 'freighter' && window.freighterApi) {
          try {
            const { isAllowed } = await window.freighterApi.isAllowed();
            if (isAllowed) {
              const { address } = await window.freighterApi.getAddress();
              const { network } = await window.freighterApi.getNetwork();
              
              setState({
                isConnected: true,
                wallet: {
                  type: 'freighter',
                  name: 'Freighter',
                  publicKey: address,
                  network: network.toLowerCase() as 'testnet' | 'mainnet',
                },
                isConnecting: false,
                error: null,
              });
              return;
            }
          } catch (error) {
            console.warn('Stored Freighter connection is no longer valid:', error);
          }
        }
        
        // If stored wallet is not accessible, clear it
        localStorage.removeItem('stellarsafe_wallet');
      }

      // Check Freighter first (most common)
      if (window.freighterApi) {
        try {
          const { isAllowed } = await window.freighterApi.isAllowed();
          if (isAllowed) {
            const { address } = await window.freighterApi.getAddress();
            const { network } = await window.freighterApi.getNetwork();
            
            setState({
              isConnected: true,
              wallet: {
                type: 'freighter',
                name: 'Freighter',
                publicKey: address,
                network: network.toLowerCase() as 'testnet' | 'mainnet',
              },
              isConnecting: false,
              error: null,
            });
            return;
          }
        } catch (error) {
          console.warn('Error checking Freighter permission:', error);
        }
      }

      // Check Albedo
      if (window.albedo) {
        // Albedo doesn't have persistent connection, skip
      }

      // Check Rabet
      if (window.rabet) {
        try {
          const isConnected = await window.rabet.isConnected();
          if (isConnected) {
            const publicKey = await window.rabet.getPublicKey();
            setState({
              isConnected: true,
              wallet: {
                type: 'rabet',
                name: 'Rabet',
                publicKey,
                network: 'mainnet', // Rabet defaults to mainnet
              },
              isConnecting: false,
              error: null,
            });
            return;
          }
        } catch (error) {
          console.warn('Error checking Rabet connection:', error);
        }
      }

      // Check xBull
      if (window.xBullSDK) {
        // xBull connection check logic - coming soon
      }
    } catch (error) {
      console.warn('Error checking existing wallet connection:', error);
    }
  }, []);

  // Check for existing connection on mount
  useEffect(() => {
    if (walletsChecked) {
      checkExistingConnection();
    }
  }, [walletsChecked, checkExistingConnection]);

  const connectFreighter = async (): Promise<WalletInfo> => {
    if (!window.freighterApi) {
      throw new Error('Freighter wallet not installed. Please install from freighter.app');
    }

    try {
      // Freighter API is a module, we need to call methods correctly
      const api = window.freighterApi;
      
      // Check if user has already granted permission
      const { isAllowed } = await api.isAllowed();
      
      if (!isAllowed) {
        // Request permission from user - this will open a popup
        await api.setAllowed();
      }

      // Get public key - this requires permission
      const { address } = await api.getAddress();
      const { network } = await api.getNetwork();

      console.log('Freighter connected:', { address, network });

      return {
        type: 'freighter',
        name: 'Freighter',
        publicKey: address,
        network: network.toLowerCase() as 'testnet' | 'mainnet',
      };
    } catch (error) {
      console.error('Freighter connection error:', error);
      if (error instanceof Error) {
        throw new Error(`Freighter connection failed: ${error.message}`);
      }
      throw new Error('Failed to connect to Freighter wallet');
    }
  };

  const connectAlbedo = async (): Promise<WalletInfo> => {
    if (!window.albedo) {
      throw new Error('Albedo wallet not installed. Please install from albedo.link');
    }

    const result = await window.albedo.publicKey({
      require_existing: false,
    });

    if (result.error) {
      throw new Error(`Albedo connection failed: ${result.error}`);
    }

    return {
      type: 'albedo',
      name: 'Albedo',
      publicKey: result.pubkey,
      network: 'mainnet', // Albedo typically uses mainnet
    };
  };

  const connectRabet = async (): Promise<WalletInfo> => {
    if (!window.rabet) {
      throw new Error('Rabet wallet not installed. Please install from rabet.io');
    }

    await window.rabet.connect();
    const publicKey = await window.rabet.getPublicKey();

    return {
      type: 'rabet',
      name: 'Rabet',
      publicKey,
      network: 'mainnet', // Rabet defaults to mainnet
    };
  };

  const connectXBull = async (): Promise<WalletInfo> => {
    if (!window.xBullSDK) {
      throw new Error('xBull wallet not installed');
    }

    // xBull connection implementation
    throw new Error('xBull integration coming soon');
  };

  const connectLobstr = async (): Promise<WalletInfo> => {
    // Lobstr connection implementation
    throw new Error('Lobstr integration coming soon');
  };

  const connect = useCallback(async (walletType: WalletType) => {
    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      let walletInfo: WalletInfo;

      switch (walletType) {
        case 'freighter':
          walletInfo = await connectFreighter();
          break;
        case 'albedo':
          walletInfo = await connectAlbedo();
          break;
        case 'rabet':
          walletInfo = await connectRabet();
          break;
        case 'xbull':
          walletInfo = await connectXBull();
          break;
        case 'lobstr':
          walletInfo = await connectLobstr();
          break;
        default:
          throw new Error(`Unsupported wallet type: ${walletType}`);
      }

      setState({
        isConnected: true,
        wallet: walletInfo,
        isConnecting: false,
        error: null,
      });

      // Store connection in localStorage for persistence
      localStorage.setItem('stellarsafe_wallet', JSON.stringify(walletInfo));

      return walletInfo;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
      
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: errorMessage,
      }));

      throw error;
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({
      isConnected: false,
      wallet: null,
      isConnecting: false,
      error: null,
    });

    localStorage.removeItem('stellarsafe_wallet');
  }, []);

  const signTransaction = useCallback(async (xdr: string) => {
    if (!state.wallet) {
      throw new Error('No wallet connected');
    }

    switch (state.wallet.type) {
      case 'freighter':
        if (!window.freighterApi) {
          throw new Error('Freighter not available');
        }
        const result = await window.freighterApi.signTransaction(xdr, {
          networkPassphrase: state.wallet.network === 'testnet' 
            ? 'Test SDF Network ; September 2015' 
            : 'Public Global Stellar Network ; September 2015',
        });
        return result.signedTxXdr;

      case 'albedo':
        if (!window.albedo) {
          throw new Error('Albedo not available');
        }
        const albedoResult = await window.albedo.tx({
          xdr,
          network: state.wallet.network === 'testnet' ? 'testnet' : 'public',
        });
        if (albedoResult.error) {
          throw new Error(`Albedo signing failed: ${albedoResult.error}`);
        }
        return albedoResult.signed_envelope_xdr;

      case 'rabet':
        if (!window.rabet) {
          throw new Error('Rabet not available');
        }
        return await window.rabet.sign(xdr, state.wallet.network);

      case 'xbull':
        throw new Error('xBull signing coming soon');

      case 'lobstr':
        throw new Error('Lobstr signing coming soon');

      default:
        throw new Error(`Unsupported wallet type: ${state.wallet.type}`);
    }
  }, [state.wallet]);

  const getAvailableWallets = useCallback(() => {
    const available: { type: WalletType; name: string; installed: boolean; description?: string }[] = [];

    // Check Freighter - try multiple ways
    const hasFreighter = !!(
      window.freighterApi || 
      (window as any).freighter ||
      document.getElementById('freighter-api')
    );
    
    console.log('Freighter detection:', {
      freighterApi: !!window.freighterApi,
      freighterAlt: !!(window as any).freighter,
      domElement: !!document.getElementById('freighter-api'),
      hasFreighter
    });
    
    available.push({
      type: 'freighter',
      name: 'Freighter',
      installed: hasFreighter,
      description: 'Browser extension wallet for Stellar',
    });

    // Check Albedo
    available.push({
      type: 'albedo',
      name: 'Albedo',
      installed: !!window.albedo,
      description: 'Web-based Stellar wallet',
    });

    // Check Rabet
    available.push({
      type: 'rabet',
      name: 'Rabet',
      installed: !!window.rabet,
      description: 'Mobile-first Stellar wallet',
    });

    // Check xBull
    available.push({
      type: 'xbull',
      name: 'xBull',
      installed: !!window.xBullSDK,
      description: 'Multi-platform Stellar wallet',
    });

    // Check Lobstr
    available.push({
      type: 'lobstr',
      name: 'Lobstr',
      installed: false, // Lobstr doesn't have browser integration yet
      description: 'Popular mobile Stellar wallet',
    });

    return available;
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    signTransaction,
    getAvailableWallets,
  };
};
