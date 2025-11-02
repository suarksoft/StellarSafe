/**
 * Wallet utility functions
 * 
 * Bu dosya Freighter wallet ile doğrudan etkileşim için yardımcı fonksiyonlar içerir.
 * Yeni projeler için useWalletConnect hook'unu veya WalletContext'i kullanın.
 */

import { StellarClient } from './stellar/client'

export async function connectWallet(): Promise<string> {
  // Freighter API'nin yüklenmesini bekle
  if (!window.freighterApi) {
    throw new Error("Freighter eklentisi bulunamadı. Lütfen Freighter extension'ını yükleyin.");
  }

  try {
    // İzin durumunu kontrol et
    const { isAllowed, error: isAllowedError } = await window.freighterApi.isAllowed();
    
    if (isAllowedError) {
      console.error("❌ İzin kontrolü hatası:", isAllowedError);
      throw new Error("Freighter'a erişim kontrol edilemedi.");
    }

    // Eğer izin yoksa, izin iste
    if (!isAllowed) {
      const { isAllowed: permissionGranted, error: permissionError } = await window.freighterApi.setAllowed();
      
      if (permissionError || !permissionGranted) {
        console.error("❌ Erişim reddedildi:", permissionError);
        throw new Error("Freighter'a erişim izni verilmedi.");
      }
    }

    // Public key'i al
    const { address, error: addressError } = await window.freighterApi.getAddress();
    
    if (addressError) {
      console.error("❌ Adres alınamadı:", addressError);
      throw new Error("Cüzdan adresi alınamadı.");
    }

    if (!address) {
      throw new Error("Cüzdan adresi alınamadı. Freighter'da bir hesap seçili olduğundan emin olun.");
    }

    console.log("✅ Cüzdan başarıyla bağlandı:", address);
    return address;
  } catch (error) {
    console.error("❌ Cüzdan bağlantı hatası:", error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error("Cüzdan bağlantısı başarısız oldu. Lütfen tekrar deneyin.");
  }
}

// Network bilgisini al
export async function getNetwork(): Promise<{ network: string; networkPassphrase: string }> {
  if (!window.freighterApi) {
    throw new Error("Freighter eklentisi bulunamadı.");
  }

  const { network, networkPassphrase, error } = await window.freighterApi.getNetwork();
  
  if (error) {
    throw new Error(`Network bilgisi alınamadı: ${error}`);
  }

  return { network, networkPassphrase };
}

// Bakiye çek
export async function getBalance(address: string, isTestnet: boolean = true): Promise<number> {
  try {
    const stellarClient = new StellarClient(isTestnet);
    const account = await stellarClient.loadAccount(address);
    
    // Native XLM bakiyesini bul
    const xlmBalance = account.balances.find(b => b.asset_type === 'native');
    return xlmBalance ? parseFloat(xlmBalance.balance) : 0;
  } catch (error) {
    console.error("Bakiye çekilemedi:", error);
    throw error;
  }
}

// Transaction imzala
export async function signTransaction(xdr: string, networkPassphrase?: string): Promise<string> {
  if (!window.freighterApi) {
    throw new Error("Freighter eklentisi bulunamadı.");
  }

  const { signedTxXdr, error } = await window.freighterApi.signTransaction(xdr, {
    networkPassphrase
  });
  
  if (error) {
    throw new Error(`Transaction imzalanamadı: ${error}`);
  }

  if (!signedTxXdr) {
    throw new Error("İmzalanmış transaction alınamadı.");
  }

  return signedTxXdr;
}
