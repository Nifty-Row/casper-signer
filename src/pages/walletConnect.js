/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
import Head from "next/head";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import Mint from "./components/mint";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Signer } from "casper-js-sdk";
import {
  checkConnection,
  getActiveKeyFromSigner,
  connectCasperSigner,
} from "../utils/CasperUtils";

const inter = Inter({ subsets: ["latin"] });

export default function walletConnect() {
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

  useEffect(() => {
    setTimeout(async () => {
      try {
        // const connected = await checkConnection();
        // setSignerConnected(connected);
      } catch (err) {
        console.log(err);
      }
    }, 100);

    const checkSignerConnection = async () => {
      try {
        if (signerConnected) setActiveKey(await getActiveKeyFromSigner());
        const signer = await Signer.isConnected();
        console.log("Signer Connected", signer);
        const publicKeyHex = await getActiveKeyFromSigner();
        console.log(publicKeyHex);
        // // const publicKey = publicKeyHex.slice(0, 8); // take the first 8 characters
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
    <>
      <Header />
      <div class="hero-wrap hero-wrap-4">
        <div class="hero-wrap sub-header">
          <div class="container">
            <div class="hero-content text-center py-0">
              <h1 class="hero-title">Connect Wallet</h1>
              <nav aria-label="breadcrumb">
                <ol class="breadcrumb breadcrumb-s1 justify-content-center mt-3 mb-0">
                  <li class="breadcrumb-item">
                    <a href="../../">Home</a>
                  </li>
                  <li class="breadcrumb-item active" aria-current="page">
                    Wallet
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </div>
      <section class="wallet-section section-space-b">
        <div class="container">
          <div class="row g-gs">
            <div class="col-sm-12 col-md-12 col-xl-6">
              <a
                href="#"
                onClick={connectCasperSigner}
                class="card-media card-full card-media-s1 flex-column justify-content-center flex-wrap p-4"
              >
                <img
                  src="../../casperSigner-icon.svg"
                  alt="logo"
                  class="card-media-img flex-shrink-0 me-0 mb-3"
                />
                <h6 class="mb-3">Casper Signer</h6>
                <span class="btn btn-sm btn-outline-secondary">Connect</span>
              </a>
            </div>
            <div class="col-sm-12 col-md-12 col-xl-6">
              <a
                href="#"
                onClick={connectCasperSigner}
                class="card-media card-full card-media-s1 flex-column justify-content-center flex-wrap p-4"
              >
                <img
                  src="../../cspr-live-full.svg"
                  alt="logo"
                  class="card-media-img flex-shrink-0 me-0 mb-3"
                />
                <h6 class="mb-3">Casper Wallet</h6>
                <span class="btn btn-sm btn-outline-secondary">Connect</span>
              </a>
            </div>
          </div>
        </div>
      </section>
      {/* <Mint /> */}
      <Footer />
    </>
  );
}
