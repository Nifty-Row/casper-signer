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
    const [loading, setLoading] = useState(true); // Add loading state
    const itemsPerPage = 12; // Number of items to show per page
    const [totalNFTs, setTotalNFTs] = useState(0); // Total number of NFTs

    const scrollToTop = () => {
      // Scroll to the top of the page
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const fetchNFTs = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
    
        fetch("https://shark-app-9kl9z.ondigitalocean.app/api/nft/media/movie")
          .then((response) => response.json())
          .then((data) => {
            setNFTs(data.slice(startIndex, endIndex));
            setTotalNFTs(data.length); // Set the total number of NFTs
            setLoading(false); // Set loading to false when data is fetched
            scrollToTop(); // Scroll to the top when new data is loaded
          })
          .catch((error) => {
            console.error(error);
            setLoading(false); // Set loading to false on error
          });
    };

    useEffect(() => {
        fetchNFTs(); // Fetch NFTs on component mount
    }, [currentPage]);

    useEffect(() => {
        // Update the current page to 1 when NFTs change (e.g., after filtering)
        // setCurrentPage(1);
    }, [nfts]);

    const totalPages = Math.ceil(totalNFTs / itemsPerPage);

    const generatePageNumbers = () => {
        const pageNumbers = [];
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(i);
        }
        return pageNumbers;
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };


  return (
    <>
      <Header />
      <div class="hero-wrap sub-header bg-image1">
        <div class="container">
          <div class="hero-content text-center py-0">
            <h1 class="hero-title text-primary">Nifty Assets</h1>
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
      {!loading && nfts?.length > 0 && (
        <div className="pagination-wrap">
          <nav aria-label="Page navigation example">
            <ul className="pagination justify-content-center mt-5 pagination-s1">
              <li className={`page-item ${currentPage === 1 && "disabled"}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(currentPage - 1)}
                  aria-disabled={currentPage === 1}
                >
                  <span aria-hidden="true" className="ni ni-chevron-left"></span>
                </button>
              </li>
              {generatePageNumbers().map((page) => (
                <li
                  key={page}
                  className={`page-item ${currentPage === page && "active"}`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                </li>
              ))}
              <li
                className={`page-item ${currentPage === totalPages && "disabled"}`}
              >
                <button
                  className="page-link"
                  onClick={() => handlePageChange(currentPage + 1)}
                  aria-disabled={currentPage === totalPages}
                >
                  <span aria-hidden="true" className="ni ni-chevron-right"></span>
                </button>
              </li>
            </ul>
          </nav>
          <p className="text-center mt-3 page-result-text">
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalNFTs)} to{" "}
            {Math.min(currentPage * itemsPerPage, totalNFTs)} of {totalNFTs} records
          </p>
        </div>
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
