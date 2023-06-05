import { Signer, CasperSigner } from "casper-js-sdk";
import { useState, useEffect } from "react";

function CasperConnect() {
  const [signerConnected, setSignerConnected] = useState(false);
  const [publicKey, setPublicKey] = useState(null);
  const [signerLocked, setSignerLocked] = useState(true);
  const [activeKey, setActiveKey] = useState("");
  const [error, setError] = useState(null);

  const buttonClass = publicKey
    ? "btn btn-success-soft p-2 mb-0"
    : "btn btn-danger-soft p-2 mb-0";

  const buttonLabel = publicKey
    ? ` ${publicKey.slice(0, 6)}...${publicKey.slice(-6)}`
    : "Connect Wallet";

  const checkConnection = async () => {
    try {
      return await Signer.isConnected();
    } catch (error) {
      if (
        error.message ===
        "Content script not found - make sure you have the Signer installed and refresh the page before trying again."
      ) {
        const installUrl = "https://www.casperwallet.io/";
        window.open(installUrl, "_blank");
        // You can also display a message to the user indicating that they need to install the wallet
      } else {
        console.error("Failed to connect to the signer:", error.message);
      }
    }
  };

  const getActiveKeyFromSigner = async () => {
    const key = await Signer.getActivePublicKey();
    console.log("Key : " + key);
    return key;
  };

  const connectToSigner = async () => {
    try {
      return Signer.sendConnectionRequest();
    } catch (error) {
      console.error("Failed to connect to the signer:", error.message);
    }
  };
  useEffect(() => {
    setTimeout(async () => {
      try {
        const connected = await checkConnection();
        alert("connected");
        setSignerConnected(connected);
      } catch (err) {
        alert("not connected");
        console.log(err);
      }
    }, 100);

    const checkSignerConnection = async () => {
      try {
        if (signerConnected) setActiveKey(await getActiveKeyFromSigner());
        const signer = await Signer.isConnected();
        const publicKeyHex = await getActiveKeyFromSigner();
        // const publicKey = publicKeyHex.slice(0, 8); // take the first 8 characters
        setPublicKey(publicKeyHex);
      } catch (error) {
        setError(
          "There was an error connecting to the Casper Signer. Please make sure you have the Signer installed and refresh the page before trying again."
        );
      }
    };
    checkSignerConnection();
  }, []);

  return (
    <button
      className={buttonClass}
      href="#"
      role="button"
      aria-expanded="false"
      onClick={connectToSigner}
    >
      {/* <i className="bi bi-wallet"></i> */}
      {buttonLabel}
    </button>
  );
}

export default CasperConnect;
