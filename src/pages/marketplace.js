import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import NFTCard from "./components/NFTCard";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [nfts, setNFTs] = useState([]);

  useEffect(() => {
    // API call to fetch NFT data
    fetch("https://shark-app-9kl9z.ondigitalocean.app/api/nft/allNfts")
      .then((response) => response.json())
      .then((data) => setNFTs(data))
      .catch((error) => console.error(error));
    console.log(nfts);
  }, [nfts]);

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
                  Marketplace
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
            {nfts.map((nft) => (
              <NFTCard key={nft.id} nftData={nft} />
            ))}
          </div>
        </div>
      </section>

      {/* <Mint /> */}
      {/* <Footer /> */}
    </>
  );
}
