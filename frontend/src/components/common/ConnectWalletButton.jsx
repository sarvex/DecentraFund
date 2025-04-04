import { useState, useEffect } from "react";
import { useContractContext } from "../../context/ContractContext";

export default function ConnectWalletButton({
  variant = "default",
  className = "",
}) {
  const { account, chainId, provider } = useContractContext();
  const [isConnecting, setIsConnecting] = useState(false);
  const [showNetworkMenu, setShowNetworkMenu] = useState(false);

  // Common networks for DApps
  const supportedNetworks = {
    1: "Ethereum",
    5: "Goerli",
    11155111: "Sepolia",
    137: "Polygon",
    80001: "Mumbai",
    56: "Binance",
    42161: "Arbitrum",
  };

  // Check if current network is supported
  const isSupportedNetwork = chainId && supportedNetworks[chainId];

  // Initialize provider if not already connected
  useEffect(() => {
    if (!account && typeof window.ethereum !== "undefined") {
      const checkConnection = async () => {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          if (accounts.length > 0 && provider) {
            // Account and chainId will be updated via context
            await provider.send("eth_requestAccounts", []);
          }
        } catch (error) {
          console.error("Error checking connection:", error);
        }
      };
      checkConnection();
    }
  }, [account, provider]);

  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      alert("Please install MetaMask to connect your wallet!");
      return;
    }

    try {
      setIsConnecting(true);
      if (!provider) {
        throw new Error("Wallet provider not initialized");
      }
      await provider.send("eth_requestAccounts", []);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert(`Failed to connect wallet: ${error.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const switchNetwork = async (chainId) => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        alert(
          "This network is not available in your wallet. Please add it first."
        );
      }
      console.error("Error switching network:", switchError);
    }
  };

  const getButtonStyles = () => {
    const baseStyles =
      "relative overflow-hidden transition-all duration-300 group";

    switch (variant) {
      case "landing":
        return `${baseStyles} border-2 border-white/50 text-white px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-full font-medium sm:font-semibold text-base sm:text-lg hover:border-white hover:bg-white/10`;
      case "mobile":
        return `${baseStyles} w-full flex justify-center items-center px-3  sm:px-4 py-2 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700`;
      default:
        return `${baseStyles} w-full max-w-xs sm:w-auto flex justify-center items-center px-4 sm:px-6 py-2 sm:py-3 border border-transparent text-xs sm:text-sm font-medium rounded-full shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`;
    }
  };

  const displayAddress = account
    ? `${account.slice(0, 6)}...${account.slice(-4)}`
    : "Connect Wallet";

  return (
    <div className="relative w-full sm:w-auto flex justify-center items-center">
      <button
        onClick={
          account ? () => setShowNetworkMenu(!showNetworkMenu) : connectWallet
        }
        disabled={isConnecting}
        className={`${getButtonStyles()} ${className} ${
          isConnecting ? "opacity-80 cursor-not-allowed" : ""
        }`}
      >
        {/* Animated background elements */}
        <span className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
        <span className="absolute inset-0 border border-transparent rounded-full animate-[spin_3s_linear_infinite] [background:conic-gradient(rgba(255,255,255,0.3)_0%,rgba(255,255,255,0)_30%,rgba(255,255,255,0)_70%,rgba(255,255,255,0.3)_100%)]"></span>

        {/* Button content */}
        <span className="relative flex items-center">
          {isConnecting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Connecting...
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 mr-2 ${
                  !account && "group-hover:animate-pulse"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              {displayAddress}
              {account && (
                <span
                  className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    isSupportedNetwork
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {isSupportedNetwork
                    ? supportedNetworks[chainId]
                    : `Unsupported (${chainId})`}
                </span>
              )}
            </>
          )}
        </span>
      </button>

      {/* Network dropdown */}
      {account && showNetworkMenu && (
        <div className="absolute right-0 bottom-full mb-2 w-48 sm:w-56 origin-bottom-right rounded-xl bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10 animate-[fadeIn_0.2s_ease-in-out]">
          <div className="py-1">
            <div className="px-4 py-2 text-sm text-gray-300 border-b border-gray-700">
              Switch Network
            </div>
            {Object.entries(supportedNetworks).map(([id, name]) => (
              <button
                key={id}
                onClick={() => switchNetwork(parseInt(id))}
                className={`flex w-full items-center px-4 py-2 text-sm ${
                  chainId === parseInt(id)
                    ? "bg-indigo-600/30 text-indigo-300"
                    : "text-gray-200 hover:bg-gray-700"
                }`}
              >
                {name}
                {chainId === parseInt(id) && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="ml-auto h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
            <div className="px-4 py-2 text-xs text-gray-400 border-t border-gray-700">
              Current: {account.slice(0, 8)}...{account.slice(-6)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
