/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-html-link-for-pages */
import Head from "next/head";
import { Inter } from "next/font/google";
import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NFTCard from "@/components/NFTCard";

const inter = Inter({ subsets: ["latin"] });

export default function Artworks() {
  const [nfts, setNFTs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Number of items to show per page

  useEffect(() => {
    fetchNFTs(); // Fetch NFTs on component mount
  }, [currentPage]);

  const fetchNFTs = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    fetch("https://shark-app-9kl9z.ondigitalocean.app/api/nft/allNFts")
      .then((response) => response.json())
      .then((data) => setNFTs(data.slice(startIndex, endIndex)))
      .catch((error) => console.error(error));
  };

  console.info("nfts: ", nfts);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <>
      <Header />
      <div class="hero-wrap sub-header bg-image1">
        <div class="container">
          <div class="hero-content text-center py-0">
            <h1 class="hero-title text-white">Nifty Artworks</h1>
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb breadcrumb-s1 justify-content-center mt-3 mb-0">
                <li class="breadcrumb-item">
                  <a href="../../">Home</a>
                </li>
                <li
                  class="breadcrumb-item active text-info"
                  aria-current="page"
                >
                  Artworks
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
      {nfts.length > 0 && (
        <nav aria-label="Page navigation">
        <ul className="pagination justify-content-center my-4 mt-4 py-4">
          <li className={`page-item ${currentPage === 1 && "disabled"}`}>
            <button
              className="page-link"
              onClick={() => handlePageChange(currentPage - 1)}
              aria-disabled={currentPage === 1}
            >
              Previous
            </button>
          </li>
          <li className="page-item">
            <span className="page-link">{currentPage}</span>
          </li>
          <li className={`page-item ${nfts.length < itemsPerPage && "disabled"}`}>
            <button
              className="page-link"
              onClick={() => handlePageChange(currentPage + 1)}
              aria-disabled={nfts.length < itemsPerPage}
            >
              Next
            </button>
          </li>
        </ul>
        </nav>
        )}

      {nfts.length === 0 && (
        <section className="explore-section pt-lg-4 mb-4">
          <div className="container mb-4">
            <div className="filter-box"></div>
            {/* <div className="gap-2x"></div> */}
            <div className="filter-container row g-gs mb-4">
              <div className="col-md-12">
                <h4 className="text-danger text-center">
                  No Assets available for This Category
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
