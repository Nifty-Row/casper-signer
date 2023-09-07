import { useEffect, useState } from "react";
import { WalletService } from "@/utils/WalletServices"; // Import your existing WalletService
import swal from "sweetalert";

// Custom hook for wallet connection
function useWalletConnection() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [activePublicKey, setActivePublicKey] = useState(null);

  // Function to connect the wallet
  const connectWallet = async () => {
    try {
      await WalletService.connect();
      setWalletConnected(true);
      const publicKey = await WalletService.getActivePublicKey();
      setActivePublicKey(publicKey);
      return publicKey;
    } catch (error) {
      console.error("Error connecting to the wallet:", error);
    }
    return false;
  };

  const getActiveKey = async () =>{
    try {
      const publicKey = await WalletService.getActivePublicKey();
      setActivePublicKey(publicKey);
    } catch (error) {
      console.error("Error checking wallet connection:", error);
    }

  }
  // Function to disconnect the wallet
  const disconnectWallet = async () => {
    try {
      await WalletService.disconnect();
      setWalletConnected(false);
      setActivePublicKey(null);
    } catch (error) {
      console.error("Error disconnecting the wallet:", error);
    }
  };

  const checkWalletConnection = async () => {
    try {
      const isConnected = await WalletService.isSiteConnected();
      setWalletConnected(isConnected);
      if (isConnected) {
        const publicKey = await WalletService.getActivePublicKey();
        setActivePublicKey(publicKey);
        // console.log("Wallet Conected");
      } else {
        setActivePublicKey(null);
        swal("Attention!", "Please connect a wallet account to continue", "warning");
      }
    } catch (error) {
      console.error("Error checking wallet connection:", error);
      setWalletConnected(false);
      setActivePublicKey(null);
      swal("Attention!", `${error.message} Please reset your wallet timeout for a better experience.`, "warning");
    }
  };

  useEffect(() => {
    checkWalletConnection();

    // Periodically check wallet connection status (every 30 seconds) if wallet is connected
    const intervalId = setInterval(() => {
      if (walletConnected) {
        checkWalletConnection();
      }
    }, 30000);
  
    // Cleanup the interval on unmount
    return () => clearInterval(intervalId);
  }, [walletConnected]);
  // Use useEffect to check wallet connection status on component mount
  useEffect(() => {
    checkWalletConnection();
  }, []);

  return {
    walletConnected,
    activePublicKey,
    connectWallet,
    disconnectWallet,
    checkWalletConnection,
  };
}

export default useWalletConnection;
