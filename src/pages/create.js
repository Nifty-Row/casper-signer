/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
import Head from "next/head";
import Image from "next/image";

import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import Mint from "./components/mint";
import Header from "./components/Header";
import Footer from "./components/Footer";
import MintForm from "./components/MintForm";
import { Signer } from "casper-js-sdk";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getActiveKeyFromSigner } from "@/utils/CasperUtils";

const inter = Inter({ subsets: ["latin"] });

export default function WalletConnect() {
  // const router = useRouter();
  const [key, setKey] = useState("");
  useEffect(() => {
    getActiveKeyFromSigner().then((data) => {
      let activeKey = data;
      alert(activeKey);
      setKey(data);
    });
  }, []);

  useEffect(() => {
    // if (!key) {
    //   const router = require("next/router").default;
    //   router.push("/walletConnect"); // Redirect to the wallet connect page if signer is not connected
    // }
  }, [key]);

  return (
    <>
      <Header />
      {/* <div class="hero-wrap hero-wrap-4">
        <div class="hero-wrap sub-header">
          <div class="container">
            <div class="hero-content text-center py-0">
              <h1 class="hero-title">Mint NFT</h1>
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
      </div> */}

      <MintForm publicKeyProp={key} />
      <Footer />
    </>
  );
}
