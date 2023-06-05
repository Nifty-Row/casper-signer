// signerUtils.js
import { Signer } from "casper-js-sdk";
import { useState, useEffect } from "react";

export const checkConnection = async () => {
  try {
    let isConnected = await Signer.isConnected();
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
  // Implementation of getActiveKeyFromSigner function
  try {
    checkConnection();
    if (Signer.isConnected()) {
      // alert("Is connected" + Signer.isConnected());
      console.log("is connected ?", await Signer.isConnected());
      const key = await Signer.getActivePublicKey();
      console.log("Wallet Public Key :" + key);
      return key;
    } else {
      // alert("Is not conneced");
    }
  } catch (error) {
    // alert("error ooo " + error);
    return false;
  }
}

// ...other functions

export const connectCasperSigner = async () => {
  if (!getActiveKeyFromSigner()) {
    alert("signer not connected");
  }
  try {
    // confirm("Are you sure ?");
    try {
      let connectSigner = await Signer.sendConnectionRequest();
    } catch (e) {
      alert(e.message);
    }

    console.log("connectSigner", connectSigner);
    // swal("Notice", connectSigner, "success");
    getActiveKeyFromSigner();
  } catch (error) {
    getActiveKeyFromSigner();
    // alert("Failed to connect to the signer:", error.message);
  }
};
