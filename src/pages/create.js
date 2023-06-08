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
import { WalletService } from "../utils/WalletServices";

const inter = Inter({ subsets: ["latin"] });

export default function WalletConnect() {
  // const router = useRouter();
  const [key, setKey] = useState("");

  useEffect(() => {
    WalletService.isSiteConnected().then(async (data) => {
      let activeKey = await WalletService.getActivePublicKey();
      setKey(activeKey);
      if (!activeKey) {
        const router = require("next/router").default;
        router.push("/walletConnect"); // Redirect to the wallet connect page if signer is not connected
      }
    });
  }, [key]);

 
  return (
    <>
      <Header />
      

      <MintForm publicKeyProp={key} />
      <Footer />
    </>
  );
}
