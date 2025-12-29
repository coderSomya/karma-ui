import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { WeilWalletConnection } from '@weilliptic/weil-sdk';
import type { User, Market } from '../types/contract';

interface WalletContextType {
  wallet: WeilWalletConnection | null;
  isConnected: boolean;
  user: User | null;
  userAddress: string | null;
  markets: Market[];
  contractAddress: string;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  refreshData: () => Promise<void>;
  setContractAddress: (address: string) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider = ({ children }: WalletProviderProps) => {
  const [wallet, setWallet] = useState<WeilWalletConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [markets, setMarkets] = useState<Market[]>([]);
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || '';

  const setContractAddress = (_address: string) => {
    console.warn('Contract address can only be set via VITE_CONTRACT_ADDRESS environment variable');
  };

  const refreshUserData = useCallback(async (address: string) => {
    if (!wallet || !contractAddress || !address) return;

    try {
      const userResult = await wallet.contracts.execute(
        contractAddress,
        'get_user',
        { id: address }
      );
      
      console.log('Refresh user data result:', userResult);
      
      // Handle Result<User, Error> response from contract
      let user = null;
      if (userResult && typeof userResult === 'object') {
        // Check if txn_result exists (Weil Wallet response format)
        let resultData = userResult;
        if ('txn_result' in userResult && typeof userResult.txn_result === 'string') {
          resultData = JSON.parse(userResult.txn_result);
        }
        
        if ('Ok' in resultData) {
          // Parse the JSON string inside Ok
          const userData = typeof resultData.Ok === 'string' 
            ? JSON.parse(resultData.Ok) 
            : resultData.Ok;
          user = userData;
        } else if ('id' in resultData) {
          // Direct user object (fallback)
          user = resultData;
        }
      }
      
      if (user && user.id) {
        setUser(user as User);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      setUser(null);
    }
  }, [wallet, contractAddress]);

  const refreshData = useCallback(async () => {
    if (!wallet || !contractAddress) {
      console.log('Cannot refresh data: wallet or contractAddress missing');
      return;
    }

    try {
      console.log('Refreshing markets data...');
      // Get markets
      const marketsResult = await wallet.contracts.execute(
        contractAddress,
        'get_markets',
        {}
      );
      
      console.log('Get markets result:', marketsResult);
      
      // Handle Result<Markets[], Error> response from contract
      let marketsData = null;
      if (marketsResult && typeof marketsResult === 'object') {
        // Check if txn_result exists (Weil Wallet response format)
        let resultData = marketsResult;
        if ('txn_result' in marketsResult && typeof marketsResult.txn_result === 'string') {
          resultData = JSON.parse(marketsResult.txn_result);
        }
        
        if ('Ok' in resultData) {
          // Parse the JSON string inside Ok
          marketsData = typeof resultData.Ok === 'string' 
            ? JSON.parse(resultData.Ok) 
            : resultData.Ok;
        } else if (Array.isArray(resultData)) {
          // Direct array (fallback)
          marketsData = resultData;
        }
      } else if (Array.isArray(marketsResult)) {
        // Direct array (fallback)
        marketsData = marketsResult;
      }
      
      if (marketsData && Array.isArray(marketsData)) {
        console.log('Setting markets:', marketsData.length, 'markets found');
        setMarkets(marketsData);
      } else {
        console.log('No valid markets data received');
      }

      // Refresh user data if we have an address
      if (userAddress) {
        await refreshUserData(userAddress);
      }
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  }, [wallet, contractAddress, userAddress, refreshUserData]);

  // Check if wallet is already connected on mount
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.WeilWallet && window.WeilWallet.isConnected()) {
        try {
          const accounts = await window.WeilWallet.request({ method: 'weil_accounts' });
          console.log('Accounts response:', accounts);
          if (accounts && Array.isArray(accounts) && accounts.length > 0) {
            const account = accounts[0];
            console.log('First account:', account, 'Type:', typeof account);
            // Handle both string addresses and object accounts
            let address: string | null = null;
            if (typeof account === 'string') {
              address = account;
            } else if (typeof account === 'object' && account !== null) {
              address = account.address || account.account || account.id || null;
              if (!address && 'toString' in account) {
                const str = account.toString();
                if (str && str !== '[object Object]') {
                  address = str;
                }
              }
            }
            
            console.log('Extracted address:', address);
            if (address && typeof address === 'string' && address.length > 0) {
              const walletConnection = new WeilWalletConnection({
                walletProvider: window.WeilWallet,
              });
              setWallet(walletConnection);
              setIsConnected(true);
              setUserAddress(address);
            }
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };

    checkWalletConnection();
  }, []);

  const connectWallet = async () => {
    try {
      if (!window.WeilWallet) {
        alert('Weil Wallet not found. Please install Weil Wallet extension.');
        return;
      }

      // Check if wallet is set up
      const isSetUp = await window.WeilWallet.isSetUp();
      if (!isSetUp) {
        alert('Weil Wallet is not set up. Please set up your wallet first.');
        return;
      }

      // Check if wallet is unlocked
      const isUnlocked = await window.WeilWallet.isUnlocked();
      if (!isUnlocked) {
        alert('Weil Wallet is locked. Please unlock your wallet first.');
        return;
      }

      // Request accounts connection
      const accounts = await window.WeilWallet.request({ method: 'weil_requestAccounts' });
      console.log('Accounts response:', accounts);
      
      if (!accounts || !Array.isArray(accounts) || accounts.length === 0) {
        alert('No accounts found. Please create an account in Weil Wallet.');
        return;
      }

      const account = accounts[0];
      console.log('First account:', account, 'Type:', typeof account);
      // Handle both string addresses and object accounts
      let address: string | null = null;
      if (typeof account === 'string') {
        address = account;
      } else if (typeof account === 'object' && account !== null) {
        address = account.address || account.account || account.id || null;
        if (!address && 'toString' in account) {
          const str = account.toString();
          if (str && str !== '[object Object]') {
            address = str;
          }
        }
      }
      
      console.log('Extracted address:', address);
      if (!address || typeof address !== 'string' || address.length === 0) {
        console.error('Invalid account format:', account);
        alert('Invalid account address format. Please check the console for details.');
        return;
      }
      
      const walletConnection = new WeilWalletConnection({
        walletProvider: window.WeilWallet,
      });

      setWallet(walletConnection);
      setIsConnected(true);
      setUserAddress(address);
      
      // User data will be refreshed by the useEffect below
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    }
  };

  const disconnectWallet = async () => {
    try {
      if (window.WeilWallet && window.WeilWallet.isConnected()) {
        await window.WeilWallet.request({ method: 'wallet_disconnect' });
      }
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    } finally {
      setWallet(null);
      setIsConnected(false);
      setUser(null);
      setUserAddress(null);
    }
  };

  // Refresh data when wallet connection is established
  useEffect(() => {
    if (isConnected && contractAddress && userAddress && wallet) {
      console.log('Wallet connected, refreshing data...', { userAddress, contractAddress });
      refreshData();
    }
  }, [isConnected, contractAddress, userAddress, wallet]);

  return (
    <WalletContext.Provider
      value={{
        wallet,
        isConnected,
        user,
        userAddress,
        markets,
        contractAddress,
        connectWallet,
        disconnectWallet,
        refreshData,
        setContractAddress: setContractAddress,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
