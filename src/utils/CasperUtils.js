// casperUtils.js
import { Signer } from "casper-js-sdk";

// const CasperWalletProvider = window.CasperWalletProvider;
// const CasperWalletEventTypes = window.CasperWalletEventTypes;

// const provider = new CasperWalletProvider();

export const checkConnection = async () => {
  try {
    const isConnected = await Signer.isConnected();
    return isConnected;
  } catch (error) {
    if (
      error.message ===
      "Content script not found - make sure you have the Signer installed and refresh the page before trying again."
    ) {
      const confirmationMessage =
        "To continue, you need to install the wallet. Do you want to proceed?";
      if (window.confirm(confirmationMessage)) {
        const installUrl =
          "https://chrome.google.com/webstore/detail/casper-signer/djhndpllfiibmcdbnmaaahkhchcoijce";
        window.open(installUrl, "_blank");
      } else {
        // Handle the case when the user cancels the installation
        return "Installation canceled by the user";
      }
    } else {
      return "Failed to connect to the signer: " + error.message;
    }
  }
};

export async function getActiveKeyFromSigner() {
  try {
    await checkConnection();
    if (await Signer.isConnected()) {
      console.log("is connected?", await Signer.isConnected());
      const key = await Signer.getActivePublicKey();
      console.log("Wallet Public Key:", key);
      return key;
    } else {
      // Handle case when not connected
    }
  } catch (error) {
    return false;
  }
}

// ...other functions

export const connectCasperSigner = async () => {
  if (!(await getActiveKeyFromSigner())) {
    alert("Signer not connected");
  }
  try {
    try {
      await Signer.sendConnectionRequest();
    } catch (e) {
      alert(e.message);
    }
    console.log("Connected to signer");
    await getActiveKeyFromSigner();
  } catch (error) {
    await getActiveKeyFromSigner();
    console.log("Failed to connect to the signer:", error.message);
  }
};

// export const connectCasperWallet = async () => {
//   if (!(await getActiveKeyFromSigner())) {
//     alert("Signer not connected");
//   }
//   try {
//     try {
//       await Signer.sendConnectionRequest();
//     } catch (e) {
//       alert(e.message);
//     }
//     console.log("Connected to signer");
//     await getActiveKeyFromSigner();
//   } catch (error) {
//     await getActiveKeyFromSigner();
//     console.log("Failed to connect to the signer:", error.message);
//   }
// };
