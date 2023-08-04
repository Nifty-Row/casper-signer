import Head from "next/head";
import { Inter } from "next/font/google";
import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import NFTCard from "./components/NFTCard";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [nfts, setNFTs] = useState([]);

  useEffect(() => {
    fetchNFTs(); // Fetch NFTs on component mount
  }, []);

  const fetchNFTs = () => {
    fetch("https://shark-app-9kl9z.ondigitalocean.app/api/nft/nftsInAuction")
      .then((response) => response.json())
      .then((data) => setNFTs(data))
      .catch((error) => console.error(error));
  };
  return (
    <>
      <Header />
      <div class="hero-wrap sub-header bg-image1">
        <div class="container">
          <div class="hero-content text-center py-0">
            <h1 class="hero-title text-white">Nifty Marketplace</h1>
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb breadcrumb-s1 justify-content-center mt-3 mb-0">
                <li class="breadcrumb-item">
                  <a href="../../">Home</a>
                </li>
                <li class="breadcrumb-item active text-info" aria-current="page">
                  Marketplace
                </li>
              </ol>
            </nav>
          </div>
        </div>
      </div>
      <section className="explore-section pt-lg-4 mb-4">
        <div className="container">
          <div className="filter-box"></div>
          {/* <div className="gap-2x"></div> */}
          <div className="filter-container row g-gs mx-auto">
            {nfts.map((nft) => (
              <NFTCard key={nft.id} nftData={nft} />
            ))}
          </div>
        </div>
      </section>
      {nfts.length == 0 && (
         <section className="explore-section pt-lg-4 mb-4">
         <div className="container mb-4">
           <div className="filter-box"></div>
           {/* <div className="gap-2x"></div> */}
           <div className="filter-container row g-gs mb-4">
             <div className="col-md-12" >
               <h4 className="text-danger text-center">No Assets available for Auction</h4>
               {/* <center><a  href="../../walletConnect" class="btn btn-primary btn-lg float-center mt-4">Connect Wallet</a></center> */}
 
             </div>
           </div>
         </div>
       </section>
      )}

      <Footer />
    </>
  );
}
