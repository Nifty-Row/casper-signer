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

  console.info("nfts: ", nfts);
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
                <li
                  class="breadcrumb-item active text-info"
                  aria-current="page"
                >
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
          <div className="filter-container row g-gs mx-auto">
            {nfts
              .filter((nft) => {
                const endDate = new Date(nft.auction.endDate);
                const today = new Date();
                return nft.auction.status === "open" && endDate > today;
              })
              .map((nft) => (
                <NFTCard key={nft.id} nftData={nft} />
              ))}
          </div>
        </div>
      </section>
      {!nfts.some((nft) => {
        const endDate = new Date(nft.auction.endDate);
        const today = new Date();
        return nft.auction.status === "open" && endDate > today;
      }) && (
        <section className="explore-section pt-lg-4 mb-4">
          <div className="container mb-4">
            <div className="filter-box"></div>
            <div className="filter-container row g-gs mb-4">
              <div className="col-md-12">
                <h4 className="text-danger text-center">
                  No Assets available for Auction
                </h4>
              </div>
            </div>
          </div>
        </section>
      )}


      <Footer />
    </>
  );
}
