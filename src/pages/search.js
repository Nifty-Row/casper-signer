/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-html-link-for-pages */
import Head from "next/head";
import { Inter } from "next/font/google";
import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NFTCard from "@/components/NFTCard";
import debounce from 'lodash/debounce';
import { useRouter } from 'next/router';
import Loading from "@/components/Loading";


const inter = Inter({ subsets: ["latin"] });

export default function Search() {
    const router = useRouter();
    const query = router.query.search;
    const [nfts, setNFTs] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true); // Add loading state
    const itemsPerPage = 12; // Number of items to show per page
    const [totalNFTs, setTotalNFTs] = useState(0); // Total number of NFTs
    const [searchQuery, setSearchQuery] = useState(query ||""); // Add search query state
    const [text, setText] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [allNFts, setAllNfts] = useState([]);
    const [selectedFilter, setSelectedFilter] = useState("*");


    useEffect(()=>{
        if(searchQuery != ""){
            setText("Showing results for : "+searchQuery);
        }else{
            setText("");
        }
    },[searchQuery]);
    const scrollToTop = () => {
      // Scroll to the top of the page
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const debouncedOnChange = debounce((value) => {
        // Handle the value change here
    }, 5000);

      const handleChange = (value) => {
        setSearchQuery(value);
    
        // Call the debounced handler after a delay
        debouncedOnChange(value);
      };

    const fetchNFTs = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
    
        fetch("https://shark-app-9kl9z.ondigitalocean.app/api/nft/allNFts")
          .then((response) => response.json())
          .then((data) => {
            setAllNfts(data);
            // setNFTs(data.slice(startIndex, endIndex));
            // setTotalNFTs(data.length); // Set the total number of NFTs
            setLoading(false); // Set loading to false when data is fetched
            // scrollToTop(); // Scroll to the top when new data is loaded
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
        const filteredData = allNFts.filter((nft) =>
          nft?.mediaName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          nft?.tokenId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          nft?.assetSymbol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          nft.user?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          nft.user?.username?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      
        const filteredAndSelectedData = selectedFilter === "*" ?
          filteredData :
          filteredData.filter((nft) => nft.mediaType == selectedFilter);
      
        const totalFilteredNFTs = filteredAndSelectedData.length;
        const totalPages = Math.ceil(totalFilteredNFTs / itemsPerPage);
      
        // Ensure currentPage is within valid range
        let newCurrentPage = currentPage;
        if (newCurrentPage < 1) {
          newCurrentPage = 1;
        }
        if (newCurrentPage > totalPages) {
          newCurrentPage = totalPages;
        }
      
        const startIndex = (newCurrentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
      
        const paginatedData = filteredAndSelectedData.slice(startIndex, endIndex);
      
        setTotalNFTs(totalFilteredNFTs);
        setNFTs(paginatedData);
        setCurrentPage(newCurrentPage); // Update currentPage in case it was out of range
        setLoading(false);
        scrollToTop();
      }, [currentPage, itemsPerPage, searchQuery, selectedFilter, allNFts]);
      
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

    if(loading ){
      return (
        <Loading />
      );
    }
  return (
    <>
      <Header />
      <div className="hero-wrap sub-header bg-image1 h-100">
        <div className="container">
          <div className="hero-content text-center py-0">
            <h1 className="hero-title text-primary">Nifty Assets</h1>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb breadcrumb-s1 justify-content-center mt-3 mb-0">
                <li className="breadcrumb-item">
                  <a href="../../">Home</a>
                </li>
                <li
                  className="breadcrumb-item active text-info"
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
            <div className="filter-box pb-5">
                <div className="filter-box-filter justify-content-between align-items-center">
                    <div className="filter-box-filter-item form-choice-wrap">
                        <select className="form-choice form-control form-control-lg filter-select" value={selectedFilter} onChange={(e) => setSelectedFilter(e.target.value)}>
                            <option value="*">All</option>
                            <option value="artwork">Artworks</option>
                            <option value="music">Music</option>
                            <option value="video">Videos</option>
                        </select>
                    </div>
                    {/* end filter-box-filter-item */}
                    <div className="filter-box-filter-item quicksearch-wrap">
                        <input type="text" placeholder="Search" title="Search by tokenID, Nft Name, Nft Symbol, username and Full Name of owners" value={searchQuery} className="form-control form-control-s1 quicksearch" onChange={(e) => handleChange(e.target.value)} />
                    </div>
                    {/* end filter-box-filter-item */}
                    <h4 className="title">{text}</h4>
                    <div className="filter-box-filter-item ms-lg-auto filter-btn-wrap">
                        {/* <div className="filter-btn-group"><a href="#" className="btn filter-btn">Digital Assets</a><a href="#" className="btn filter-btn">Physical Assets</a></div> */}
                    </div>
                    {/* end filter-box-filter-item */}
                    <div className="filter-box-filter-item filter-mobile-action ms-lg-auto">
                        <div className="filter-box-search-mobile dropdown me-2">
                            <a className="icon-btn" href="#" data-bs-toggle="dropdown"><em className="ni ni-search"></em></a>
                            <div className="dropdown-menu dropdown-menu-end card-generic card-generic-s2 mt-2 p-3"><input type="text" placeholder="Search By Name" className="form-control form-control-s1 quicksearch" /></div>
                        </div>
                        <div className="filter-box-btn-group-mobile dropdown">
                            <a className="icon-btn" href="#" data-bs-toggle="dropdown"><em className="ni ni-filter"></em></a>
                            <div className="dropdown-menu dropdown-menu-end card-generic mt-2 p-3">
                                <div className="filter-btn-group filter-btn-group-s1"><a href="#" className="btn filter-btn">Type: Digital</a><a href="#" className="btn filter-btn">Type: Physical</a></div>
                            </div>
                        </div>
                        {/* end filter-box-btn-group-mobile */}
                    </div>
                    {/* end filter-box-filter-item */}
                </div>
                {/* end filter-box-filter */}
            </div>
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
                  No Assets available for your search and category
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
