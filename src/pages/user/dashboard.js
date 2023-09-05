/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/rules-of-hooks */
import Head from "next/head";
import Image from "next/image";
import axios from "axios";
import { Inter } from "next/font/google";
import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { WalletService } from "@/utils/WalletServices";
import { truncateKey } from "@/utils/generalUtils";
import ProfileForm from "@/pages/components/ProfileForm";
import Copier from "../components/Copier";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [userData, setUserData] = useState(null);
  const [activeKey, setActiveKey] = useState();
  const image = "../../img_405324.png";
  const [totalNFTs,setTotalNfts] = useState(0);
  const [movieNFTs,setMovieNfts] = useState(0);
  const [artworkNFTs,setArtworkNfts] = useState(0);
  const [musicNFTs,setMusicNfts] = useState(0);
  const [ownedNFTs,setOwnedNfts] = useState(0);
  const [auctionNFTs,setAuctionNfts] = useState(0);

  const fetchUserData = async (key) => {
    try {
      const url = `https://shark-app-9kl9z.ondigitalocean.app/api/user/userByKey/${key}`;
      const response = await axios.get(url);
      return response.data; // Return the fetched data
    } catch (error) {
      console.error("Error:", error);
      return null; // Return null in case of an error
    }
  };

  useEffect(() => {
    if (WalletService.isSiteConnected()) {
      WalletService.getActivePublicKey()
        .then((key) => {
          setActiveKey(key);
          return fetchUserData(key);
        })
        .then((userData) => {
          if (userData) {
            setUserData(userData);            // ...
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, []);


  useEffect(() =>{
    const getUserNFTs = async (key) => {
      if (key) {
        try {
          const response = await fetch(
            `https://shark-app-9kl9z.ondigitalocean.app/api/nft/nftsByOwner/${key}`
          );
          
          const nfts = await response.json();
          const totalNFTs = nfts?.length;
          const movieNFTs = nfts?.filter((nft) => nft.mediaType === "movie").length;
          const artworkNFTs = nfts?.filter((nft) => nft.mediaType === "artwork").length;
          const musicNFTs = nfts?.filter((nft) => nft.mediaType === "music").length;
          const ownedNFTs = nfts?.filter((nft) => nft.ownerKey === key && nft.ownerKey!== nft.deployerKey).length;
          const auctionNFTs = nfts?.filter((nft) => nft.ownerKey === key && nft.inAuction).length;
          console.log("Artworks",artworkNFTs);
          setTotalNfts(totalNFTs);
          setMovieNfts(movieNFTs);
          setArtworkNfts(artworkNFTs);
          setMusicNfts(musicNFTs);
          setOwnedNfts(ownedNFTs);
          setAuctionNfts(auctionNFTs);
          
      } catch (error) {
          console.error(error);
        }
        
      }
    };
    getUserNFTs(activeKey);
  },[activeKey]);

  if(!activeKey){
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
                  Profile
                </li>
              </ol>
            </nav>
          </div>
        </div>
      </div>
      <section className="explore-section pt-lg- mb-4">
        <div className="container">
          <div className="filter-box"></div>
          {/* <div className="gap-2x"></div> */}
          <div className="filter-container row g-gs">
            <div className="col-md-12 mb-4" >
              <h4 className="text-danger text-center">Please ensure your wallet is connected to view profile</h4>
              <center><a  href="../../walletConnect" class="btn btn-primary btn-lg float-center mt-4">Connect Wallet</a></center>

            </div>
          </div>
        </div>
      </section>
        
      {/* <Footer /> */}
    </>
    );
  }
    
  return (
    <>
      <Header />
      <div class="hero-wrap sub-header bg-image" >
        <div class="container">
            <div class="hero-content py-0 d-flex align-items-center">
                <div class="avatar avatar-3 flex-shrink-0">
                  <img src={image} width={100} height={100} alt={userData?.fullName} loading="lazy" /></div>
                <div class="author-hero-content-wrap d-flex flex-wrap justify-content-between ms-3 flex-grow-1">
                    <div class="author-hero-content me-3">
                        <h4 class="hero-author-title mb-1 text-white">{userData?.fullName}</h4>
                        <p class="hero-author-username mb-1 text-white">@{userData?.username}</p>
                        <Copier text={userData?.publicKey} />
                    </div>
                    {/* <div class="hero-action-wrap d-flex align-items-center my-2">
                        <button type="button" class="btn btn-light">Follow</button>
                        <div class="dropdown ms-3">
                            <a class="icon-btn icon-btn-s1" href="#" data-bs-toggle="dropdown" id="reportDropdown"><em class="ni ni-more-h"></em></a>
                            <ul class="dropdown-menu card-generic p-2 dropdown-menu-end mt-2 card-generic-sm" aria-labelledby="reportDropdown">
                                <li><a class="dropdown-item card-generic-item" href="#" data-bs-toggle="modal" data-bs-target="#reportModal">Report Page</a></li>
                            </ul>
                        </div>
                    </div> */}
                </div>
            </div>
        </div>
    </div>
    <section class="profile-section section-space">
                <div class="container">
                    <div class="row">
                        <div class="col-lg-3">
                            <div class="sidebar-head d-flex flex-wrap align-items-center justify-content-between">
                                <h3 class="sidebar-head-title">Account Settings</h3>
                                <div class="sidebar-head-action d-flex align-items-center">
                                    <div class="sidebar-drop">
                                        <a class="icon-btn menu-toggler-user-open" href="#"><em class="ni ni-menu"></em></a>
                                    </div>
                                </div>
                            </div>
                            <div class="sidebar sidebar-user-mobile">
                                <a href="#" class="icon-btn menu-toggler-user-close"><em class="ni ni-cross"></em></a>
                                <div class="sidebar-widget">
                                    <ul class="user-nav">
                                        <li class="active">
                                          <a href="../../user/dashboard" className="text-primary"><em class="ni ni-home-fill me-2"></em>DashBoard</a>
                                        </li>
                                        <li>
                                            <a href="../../user/profile"><em class="ni ni-edit me-2"></em>Edit Profile</a>
                                        </li>
                                        <li>
                                            <a href="../../user/assets"><em class="ni ni-money me-2"></em>My Assets</a>
                                        </li>
                                        
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-9 ps-xl-5">
                          <div class="user-panel-title-box"><h3>Account Settings</h3></div>
                            <div class="profile-setting-panel-wrap">
                              <div class="container">
                                <div class="row">
                                    <div class="col-6 col-sm-4 col-lg-4 my-2">
                                      <div class="card">
                                        <button class="btn btn-link card-button" id="all-tab">
                                          <img src="../../assets/images/thumb/icon-nfts.svg" class="icon icon-svg icon-lg p-3 icon-wbg mx-auto mb-4 text-info" alt="" />
                                          <h5 className="title">{totalNFTs}</h5>
                                          <span class="nav-link-title mt-3 d-block">Total Assets</span>
                                          
                                        </button>
                                      </div>
                                    </div>
                                    <div class="col-6 col-sm-4 col-lg-4 my-2">
                                      <div class="card">
                                        <button class="btn btn-link card-button" id="art-tab">
                                        <span class="icon ni ni-camera icon-lg icon-wbg mx-auto mb-4 text-primary"></span>
                                        <h5 className="title">{artworkNFTs}</h5>
                                        <span class="nav-link-title mt-3 d-block">Artworks</span>
                                        </button>
                                      </div>
                                    </div>
                                    <div class="col-6 col-sm-4 col-lg-4 my-2">
                                      <div class="card">
                                        <button class="btn btn-link card-button" id="virtual-worlds-tab">
                                        <span class="icon ni ni-video icon-lg icon-wbg mx-auto mb-4 text-primary"></span>
                                        <h5 className="title">{movieNFTs}</h5>
                                          <span class="nav-link-title mt-3 d-block">Movies</span>
                                        </button>
                                      </div>
                                    </div>
                                    <div class="col-6 col-sm-4 col-lg-4 my-2">
                                      <div class="card">
                                        <button class="btn btn-link card-button">
                                        <span class="icon ni ni-music icon-lg icon-wbg mx-auto mb-4 text-primary"></span>
                                        <h5 className="title">{musicNFTs}</h5>
                                          <span class="nav-link-title mt-3 d-block">Music</span>
                                        </button>
                                      </div>
                                    </div>
                                    <div class="col-6 col-sm-4 col-lg-4 my-2">
                                      <div class="card">
                                        <button class="btn btn-link card-button" id="all-tab">
                                          <img src="../../assets/images/thumb/icon-nfts.svg" class="icon icon-svg icon-lg p-3 icon-wbg mx-auto mb-4 text-info" alt="" />
                                          <h5 className="title">{ownedNFTs}</h5>
                                          <span class="nav-link-title mt-3 d-block">Owned</span>
                                          
                                        </button>
                                      </div>
                                    </div>
                                    <div class="col-6 col-sm-4 col-lg-4 my-2">
                                      <div class="card">
                                        <button class="btn btn-link card-button" id="all-tab">
                                          <img src="../../assets/images/thumb/icon-nfts.svg" class="icon icon-svg icon-lg p-3 icon-wbg mx-auto mb-4 text-info" alt="" />
                                          <h5 className="title">{auctionNFTs}</h5>
                                          <span class="nav-link-title mt-3 d-block">In Auction</span>
                                          
                                        </button>
                                      </div>
                                    </div>
                                    
                                </div>
                              </div>
                            </div>
                        </div>
                    </div>
                    </div>
            </section>
      
    </>
  );
}
