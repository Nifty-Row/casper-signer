/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
import Head from "next/head";
import Image from "next/image";

import { Inter } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MintForm from "@/components/MintForm";
import { useEffect, useState } from "react";
import useWalletConnection from "@/hooks/useWalletConnection"; // Replace with the correct path
import { getWalletBalance,totesToCSPR} from "@/utils/generalUtils";
import Loading from "@/components/Loading";

const inter = Inter({ subsets: ["latin"] });

export default function WalletConnect() {
  // const router = useRouter();
  const [key, setKey] = useState("");
  const [isloading,setIsloading] = useState(true);
  const {
    walletConnected,
    activePublicKey,
    connectWallet,
    disconnectWallet,
    checkWalletConnection,
  } = useWalletConnection();

  useEffect(() => {
    if(walletConnected) {
      
      setKey(activePublicKey)
      // if (!activeKey) {
      //   const router = require("next/router").default;
      //   router.push("/walletConnect"); // Redirect to the wallet connect page if wallet is not connected
      // }else{
      //   if(!key) setKey(activeKey);
      // }
    }else{
      console.log("is conected",checkWalletConnection());
      setIsloading(false);
    }
  }, [key,activePublicKey]);

  const [walletBalance, setWalletBalance]= useState("checking balance"); 
  
  useEffect(() => {
    const checkBalance = async () => {
      if (!key) return;
      try {
        const balance = await getWalletBalance(key);
        console.log("wallet Balance", totesToCSPR(balance));
        setWalletBalance(totesToCSPR(balance || 0)); // Set to 0 if balance is undefined
        setIsloading(false);
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
        setWalletBalance(0); // Set to 0 in case of error
        setIsloading(false);
      }
    };
    
    if (walletBalance === "checking balance") {
      checkBalance();
    }
  }, [key, walletBalance]);
  
  if(isloading ){
    return (
      <Loading />
    );
  }
  if(key=="" && !isloading ){
    return (
      <>
      <Header 
        publicKey={activePublicKey}
        walletConnected={walletConnected}
      />
      <div className="hero-wrap sub-header">
        <div className="container">
          <div className="hero-content text-center py-0">
            <h1 className="hero-title">Nifty Marketplace</h1>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb breadcrumb-s1 justify-content-center mt-3 mb-0">
                <li className="breadcrumb-item">
                  <a href="../../">Home</a>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
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
              <center><p className=" float-center mt-4">click the button above to connect</p></center>

            </div>
          </div>
        </div>
      </section>
        
      <Footer />
    </>
    );
  }

  return (
    <>
      <Header 
        publicKey={activePublicKey}
        walletConnected={walletConnected}
      />
      <div className="hero-wrap sub-header">
        <div className="container">
          <div className="hero-content text-center py-0">
            <h1 className="hero-title">Mint NFT</h1>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb breadcrumb-s1 justify-content-center mt-3 mb-0">
                <li className="breadcrumb-item">
                  <a href="../../">Home</a>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Create
                </li>
              </ol>
            </nav>
          </div>
        </div>
      </div>
     {walletBalance > 100 ?(
      <MintForm keyprop={key} balance={walletBalance} />):(
       <>
           <div className="col-md-12" >
              <h4 className="text-danger text-center">Please ensure your wallet is well funded to mint an NFT</h4>
             <center><p className="text-primary text-center">Your wallet balance is <b>{walletBalance}</b>CSPR. You need at least 100CSPR to mint.</p></center>
            </div>
       </>
       )};
      <Footer />
    </>
  );
 
}
