import Head from "next/head";
import { Inter } from "next/font/google";
import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NFTCard from "@/components/NFTCard";
import Loading from "@/components/Loading";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [nfts, setNFTs] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    fetchNFTs(); // Fetch NFTs on component mount
  }, []);

  const fetchNFTs = () => {
    fetch("https://shark-app-9kl9z.ondigitalocean.app/api/nft/nftsInAuction")
      .then((response) => response.json())
      .then((data) => {
        setNFTs(data);
        setLoading(false); // Set loading to false on success

      })
      .catch((error) => {
        console.error(error);
        setLoading(false); // Set loading to false on error

      });
  };

  if(loading ){
    return (
      <Loading />
    );
  }

  return (
    <>
      <Header />
      <div className="hero-wrap sub-header bg-image1">
        <div className="container">
          <div className="hero-content text-center py-0">
            <h1 className="hero-title text-white">Nifty Marketplace</h1>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb breadcrumb-s1 justify-content-center mt-3 mb-0">
                <li className="breadcrumb-item">
                  <a href="../../">Home</a>
                </li>
                <li
                  className="breadcrumb-item active text-info"
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
