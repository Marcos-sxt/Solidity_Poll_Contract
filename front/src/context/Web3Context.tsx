
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

// Extend the Window interface to include the ethereum property
declare global {
  interface Window {
    ethereum?: any;
  }
}
import { ethers } from 'ethers';
import { useToast } from '@/components/ui/use-toast';
import PollABI from '@/lib/PollABI.json';

// Replace with your deployed contract address - users can update this
const DEFAULT_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";

interface Web3ContextType {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  contract: ethers.Contract | null;
  connectWallet: () => Promise<void>;
  contractAddress: string;
  setContractAddress: (address: string) => void;
  isWrongNetwork: boolean;
  switchToCorrectNetwork: () => Promise<void>;
  isLoading: boolean;
}

const Web3Context = createContext<Web3ContextType | null>(null);

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export const Web3Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [contractAddress, setContractAddress] = useState(DEFAULT_CONTRACT_ADDRESS);
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();

  // Initialize the provider when component mounts
  useEffect(() => {
    if (window.ethereum) {
      try {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(web3Provider);
      } catch (error) {
        console.error("Error initializing web3 provider:", error);
      }
    }
  }, []);

  // Update contract instance when contract address or signer changes
  useEffect(() => {
    if (signer && contractAddress && contractAddress !== "0x0000000000000000000000000000000000000000") {
      try {
        const contractInstance = new ethers.Contract(contractAddress, PollABI, signer);
        setContract(contractInstance);
      } catch (error) {
        console.error("Error creating contract instance:", error);
        toast({
          title: "Contract Error",
          description: "Failed to connect to the contract. Check the address and network.",
          variant: "destructive"
        });
      }
    } else {
      setContract(null);
    }
  }, [signer, contractAddress, toast]);

  // Check network and set up listeners
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          // Check if already connected
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            setIsConnected(true);
            
            const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
            const parsedChainId = parseInt(chainIdHex, 16);
            setChainId(parsedChainId);
            
            // For demo purposes, we'll just check if we're on a testnet (not mainnet)
            setIsWrongNetwork(parsedChainId === 1); // 1 is Ethereum mainnet
          }
        } catch (error) {
          console.error("Error checking connection:", error);
        }
      }
    };

    checkConnection();

    // Set up event listeners
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
        } else {
          setAddress(null);
          setIsConnected(false);
        }
      };

      const handleChainChanged = (chainIdHex: string) => {
        const parsedChainId = parseInt(chainIdHex, 16);
        setChainId(parsedChainId);
        setIsWrongNetwork(parsedChainId === 1); // 1 is Ethereum mainnet
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  // Update signer when provider or address changes
  useEffect(() => {
    if (provider && isConnected) {
      const signerInstance = provider.getSigner();
      setSigner(signerInstance);
    } else {
      setSigner(null);
    }
  }, [provider, isConnected]);

  const connectWallet = async () => {
    if (window.ethereum) {
      setIsLoading(true);
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        setAddress(accounts[0]);
        setIsConnected(true);
        
        const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
        const parsedChainId = parseInt(chainIdHex, 16);
        setChainId(parsedChainId);
        setIsWrongNetwork(parsedChainId === 1); // 1 is Ethereum mainnet
        
        toast({
          title: "Wallet Connected",
          description: `Connected to ${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}`,
        });
      } catch (error: any) {
        console.error("Error connecting wallet:", error);
        toast({
          title: "Connection Failed",
          description: error.message || "Could not connect to your wallet.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      toast({
        title: "MetaMask Required",
        description: "Please install MetaMask browser extension to use this app.",
        variant: "destructive"
      });
    }
  };

  const switchToCorrectNetwork = async () => {
    if (!window.ethereum) return;
    
    setIsLoading(true);
    try {
      // For this example, we'll switch to Sepolia testnet
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // 11155111 (Sepolia) in hex
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0xaa36a7', // 11155111 (Sepolia) in hex
                chainName: 'Sepolia Testnet',
                nativeCurrency: {
                  name: 'Sepolia ETH',
                  symbol: 'ETH',
                  decimals: 18
                },
                rpcUrls: ['https://sepolia.infura.io/v3/'],
                blockExplorerUrls: ['https://sepolia.etherscan.io']
              },
            ],
          });
        } catch (addError) {
          console.error("Error adding network:", addError);
          toast({
            title: "Network Error",
            description: "Failed to add the network to your wallet.",
            variant: "destructive"
          });
        }
      } else {
        console.error("Error switching network:", switchError);
        toast({
          title: "Network Error",
          description: "Failed to switch networks.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    isConnected,
    address,
    chainId,
    provider,
    signer,
    contract,
    connectWallet,
    contractAddress,
    setContractAddress,
    isWrongNetwork,
    switchToCorrectNetwork,
    isLoading
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};
