/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
import Head from "next/head";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Inter } from "next/font/google";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { WalletService } from '../utils/WalletServices';
import swal from "sweetalert";
import axios from "axios";

const inter = Inter({ subsets: ["latin"] });

export default function walletConnect() {

  const [walletConnected, setWalletConnected] = useState(false);
  const [publicKey, setPublicKey] = useState(null);
  const [walletLocked, setWalletLocked] = useState(true);
  const [activeKey, setActiveKey] = useState("");
  const [error, setError] = useState(null);

  const buttonClass = publicKey
    ? "btn btn-success-soft p-2 mb-0"
    : "btn btn-danger-soft p-2 mb-0";

  const buttonLabel = publicKey
    ? ` ${publicKey.slice(0, 6)}...${publicKey.slice(-6)}`
    : "Connect Wallet";


    const connectCasperWallet = async () => {
      try {
        await WalletService.connect();
        let activeKey =  await WalletService.getActivePublicKey();
        if (!activeKey) {
          swal('Error', 'Could not connect Wallet', 'warning');
          return false;
        }

        const response = await walletToUser(activeKey);
        if (response == "Success") {
          const router = require("next/router").default;
          router.push("/");
        } 
      } catch (error) {
        console.error("Error making API call:", error);
        // Handle the error, e.g., show an error message to the user.
      }
    };
    

  useEffect(() => {
    setTimeout(async () => {
      try {
        const connected = await WalletService.isSiteConnected();
        // swal("Info","Casper Wallet Connection ?"+connected,"info");
        setWalletConnected(connected);
      } catch (err) {
        swal("Info","Casper Wallet Connection Error "+err.message,"info");
        console.log(err);
      }
    }, 100);

    const checkWalletConnection = async () => {
      try {
        if (walletConnected) setPublicKey(await WalletService.getActivePublicKey());
      } catch (error) {
        setError(
          "There was an error connecting to the Casper Wallet. Please make sure you have the Wallet installed and refresh the page before trying again."
        );
      }
    };
    checkWalletConnection();
  }, [walletConnected]);

  async function  walletToUser(key) {
    try {
      const response = await axios.put("https://shark-app-9kl9z.ondigitalocean.app/api/user/addNewWallet", {
        publicKey: key,
      });
      if (response.status === 200) {
        return response.data; // Return a success message or data if needed
      } else {
        swal("Error","Failed to add new wallet.","error");
        return false;
      }
    } catch (error) {
      swal("Error","Failed to add new wallet.","error");
      console.error("Error adding new wallet:", error.message);
      return false;
    }
    return false;
  }

  useEffect(() => {
    const fetchUserByKey = async () => {
      try {
        const response = await axios.get(`https://shark-app-9kl9z.ondigitalocean.app/api/user/userByKey/${publicKey}`); // Call the API route
        console.log(response);
        setUser(response.data); // Update the user state with the API response
      } catch (error) {
        console.error('Error fetching user by key:', error);
      }
    };

    fetchUserByKey();
  }, [publicKey]);


  return (
    <>
      <Header />
      <div className="hero-wrap hero-wrap-4">
        <div className="hero-wrap sub-header">
          <div className="container">
            <div className="hero-content text-center py-0">
              <h1 className="hero-title">Connect Wallet</h1>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb breadcrumb-s1 justify-content-center mt-3 mb-0">
                  <li className="breadcrumb-item">
                    <a href="../../">Home</a>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Wallet
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </div>
      <section className="wallet-section section-space-b">
        <div className="container">
          <div className="row g-gs">
            <div className="col-sm-12 col-md-12 col-xl-12">
              <a
                href="#"
                onClick={connectCasperWallet}
                className="card-media card-full card-media-s1 flex-column justify-content-center flex-wrap p-4"
              >
                <img
                  src="../../cspr-live-full.svg"
                  alt="logo"
                  className="card-media-img flex-shrink-0 me-0 mb-3"
                />
                <h6 className="mb-3">Casper Wallet</h6>
                <span className="btn btn-sm btn-outline-secondary">{buttonLabel}</span>
              </a>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
