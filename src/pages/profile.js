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
      <div class="hero-wrap sub-header" >
        <div class="container">
            <div class="hero-content py-0 d-flex align-items-center">
                <div class="avatar avatar-3 flex-shrink-0"><img src="https://cdn.onlinewebfonts.com/svg/img_405324.png" alt="avatar" /></div>
                <div class="author-hero-content-wrap d-flex flex-wrap justify-content-between ms-3 flex-grow-1">
                    <div class="author-hero-content me-3">
                        <h4 class="hero-author-title mb-1 text-white">French Montana</h4>
                        <p class="hero-author-username mb-1 text-white">@frenchmontana</p>
                        <div class="d-flex align-items-center">
                            <input type="text" class="copy-input text-white" value="0x76669f...a0e9ca" id="copy-input" readonly />
                            <div class="tooltip-s1">
                                <button data-clipboard-target="#copy-input" class="copy-text text-white ms-2" type="button"><span class="tooltip-s1-text tooltip-text">Copy</span><em class="ni ni-copy"></em></button>
                            </div>
                        </div>
                    </div>
                    <div class="hero-action-wrap d-flex align-items-center my-2">
                        <button type="button" class="btn btn-light">Follow</button>
                        <div class="dropdown ms-3">
                            <a class="icon-btn icon-btn-s1" href="#" data-bs-toggle="dropdown" id="reportDropdown"><em class="ni ni-more-h"></em></a>
                            <ul class="dropdown-menu card-generic p-2 dropdown-menu-end mt-2 card-generic-sm" aria-labelledby="reportDropdown">
                                <li><a class="dropdown-item card-generic-item" href="#" data-bs-toggle="modal" data-bs-target="#reportModal">Report Page</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <section class="author-section section-space">
                <div class="container">
                    <div class="row">
                        <div class="col-xl-3">
                            <div class="sidebar mb-5 mb-xl-0 row">
                                <div class="col-md-6 col-lg-6 col-xl-12 sidebar-widget">
                                    <h3 class="mb-3">About Me</h3>
                                    <p class="sidebar-text mb-3">I make art with the simple goal of giving you something pleasing to look at for a few seconds.</p>
                                    <p class="sidebar-text text-dark-gray">
                                        <span class="me-4"><strong class="text-black">0</strong> Following</span><span><strong class="text-black">0</strong> Followers</span>
                                    </p>
                                    
                                </div>
                                <div class="col-md-6 col-lg-6 col-xl-12 sidebar-widget">
                                    <h3 class="mb-3">Links</h3>
                                    <ul class="social-links">
                                        {/* <li>
                                            <a href="#"><span class="ni ni-globe icon"></span>frenchmontana.com</a>
                                        </li> */}
                                        <li>
                                            <a href="#"><span class="ni ni-facebook-f icon"></span>Facebook</a>
                                        </li>
                                        <li>
                                            <a href="#"><span class="ni ni-twitter icon"></span>Twitter</a>
                                        </li>
                                        <li>
                                            <a href="#"><span class="ni ni-instagram icon"></span>Instagram</a>
                                        </li>
                                    </ul>
                                </div>
                                <div class="col-md-6 col-lg-6 col-xl-12 sidebar-widget">
                                    <h3 class="mb-2">Joined</h3>
                                    <p class="sidebar-text"></p>
                                </div>
                            </div>
                        </div>
                        <div class="col-xl-9 ps-xl-4">
                            <div class="author-items-wrap">
                                <ul class="nav nav-tabs nav-tabs-s1" id="myTab" role="tablist">
                                    <li class="nav-item" role="presentation">
                                        <button class="nav-link active" id="on-sale-tab" data-bs-toggle="tab" data-bs-target="#on-sale" type="button" role="tab" aria-controls="on-sale" aria-selected="true">On Sale</button>
                                    </li>
                                    <li class="nav-item" role="presentation">
                                        <button class="nav-link" id="owned-tab" data-bs-toggle="tab" data-bs-target="#owned" type="button" role="tab" aria-controls="owned" aria-selected="false">Owned</button>
                                    </li>
                                    <li class="nav-item" role="presentation">
                                        <button class="nav-link" id="created-tab" data-bs-toggle="tab" data-bs-target="#created" type="button" role="tab" aria-controls="created" aria-selected="false">Created</button>
                                    </li>
                                </ul>
                                <div class="gap-2x"></div>
                               
                            </div>
                        </div>
                    </div>
                </div>
            </section>
      
    </>
  );
}
