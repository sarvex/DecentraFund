import { useState, useEffect, useCallback } from "react";
import { Contract, BrowserProvider } from "ethers";

// Contract ABIs would be imported here
// import CampaignFactoryABI from '../contracts/CampaignFactory.json';
// import CampaignABI from '../contracts/Campaign.json';

export function useContract() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contracts, setContracts] = useState({});
  const [txStatus, setTxStatus] = useState({
    pending: false,
    success: false,
    error: null,
  });

  // Initialize provider and signer
  const initProvider = useCallback(async () => {
    if (window.ethereum) {
      try {
        const newProvider = new BrowserProvider(window.ethereum);
        setProvider(newProvider);
        const newSigner = await newProvider.getSigner();
        setSigner(newSigner);
        return { provider: newProvider, signer: newSigner };
      } catch (error) {
        console.error("Error initializing provider:", error);
        throw error;
      }
    }
    throw new Error("Ethereum provider not found");
  }, []);

  // Get contract instance
  const getContract = useCallback(
    async (address, abi) => {
      if (!signer) {
        const { signer: newSigner } = await initProvider();
        return new Contract(address, abi, newSigner);
      }
      return new Contract(address, abi, signer);
    },
    [signer, initProvider]
  );

  // Execute contract write function
  const executeTx = useCallback(async (txFunction, args, options = {}) => {
    setTxStatus({ pending: true, success: false, error: null });
    try {
      const tx = await txFunction(...args);
      const receipt = await tx.wait();
      setTxStatus({ pending: false, success: true, error: null });
      return receipt;
    } catch (error) {
      console.error("Transaction failed:", error);
      setTxStatus({ pending: false, success: false, error });
      throw error;
    }
  }, []);

  // Read contract data
  const readContract = useCallback(async (contract, method, args = []) => {
    try {
      return await contract[method](...args);
    } catch (error) {
      console.error("Read operation failed:", error);
      throw error;
    }
  }, []);

  return {
    provider,
    signer,
    contracts,
    txStatus,
    initProvider,
    getContract,
    executeTx,
    readContract,
  };
}
