/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
import Head from "next/head";
import Image from "next/image";

import { Inter } from "next/font/google";
import Header from "./components/Header";
import Footer from "./components/Footer";
import MintForm from "./components/MintForm";
import { useEffect, useState } from "react";
import { WalletService } from "../utils/WalletServices";
import { getWalletBalance,totesToCSPR} from "../utils/generalUtils";

const inter = Inter({ subsets: ["latin"] });

export default function WalletConnect() {
  // const router = useRouter();
  const [key, setKey] = useState("");

  useEffect(() => {
    WalletService.isSiteConnected().then(async (data) => {
      let activeKey = await WalletService.getActivePublicKey();
      
      if (!activeKey) {
        const router = require("next/router").default;
        router.push("/walletConnect"); // Redirect to the wallet connect page if wallet is not connected
      }else{
        if(!key) setKey(activeKey);
      }
    });
  }, [key]);

  const [walletBalance, setWalletBalance]= useState("unchecked"); 
  
   useEffect(() =>{ 
     const checkBalance = async () =>{ 
       if(!key) return; 
       const balance = await getWalletBalance(key); 
       setWalletBalance(balance);   
     } 
     if(walletBalance !== "unchecked") return; 
     checkBalance(); 
   },[key,walletBalance]); 
 

  return (
    <>
      <Header />
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
                  Create
                </li>
              </ol>
            </nav>
          </div>
        </div>
      </div>
     {parseInt(walletBalance) > 1000000000 ?(
      <MintForm publicKeyProp={key} />):(
       <>
           <div className="col-md-12" >
              <h4 className="text-danger text-center">Please ensure your wallet is well funded to mint an NFT</h4>
             <p>Your wallet balance is {totesToCSPR(walletBalance)}CSPR. You need at least 100CSPR to mint.</p>
            </div>
       </>
       )};
      <Footer />
    </>
  );

  if(!key){
    return (
      <>
      <Header />
      <div class="hero-wrap sub-header">
        <div class="container">
          <div class="hero-content text-center py-0">
            <h1 class="hero-title">Nifty Marketplace</h1>
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb breadcrumb-s1 justify-content-center mt-3 mb-0">
                <li class="breadcrumb-item">
                  <a href="../../">Home</a>
                </li>
                <li class="breadcrumb-item active" aria-current="page">
                  Create
                </li>
              </ol>
            </nav>
          </div>
        </div>
      </div>
      <section className="explore-section pt-lg-4">
        <div className="container">
          <div className="filter-box"></div>
          {/* <div className="gap-2x"></div> */}
          <div className="filter-container row g-gs">
            <div className="col-md-12" >
              <h4 className="text-danger text-center">Please ensure your wallet is connected to mint an NFT</h4>
              <center><a  href="../../walletConnect" class="btn btn-primary btn-lg float-center mt-4">Connect Wallet</a></center>

            </div>
          </div>
        </div>
      </section>
        
      {/* <Footer /> */}
    </>
    );
  }
 
}
