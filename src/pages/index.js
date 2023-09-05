/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-html-link-for-pages */
import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import Header from "./components/Header";
import Footer from "./components/Footer";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {

  return (
    <>
      <Header />
      <div className="hero-wrap hero-wrap-4">
        <div className="container">
          <div className="row align-items-center flex-lg-row-reverse justify-lg-content-center ">
            <div class="col-lg-6 col-sm-9 col-md-6">
              <div class="hero-image">
                <img src="../assets/images/thumb/nft-img.png" alt="" class="w-100" />
              </div>
            </div>
            <div className="col-lg-6 col-sm-9">
              <div className="hero-content pt-lg-0 pb-0 mt-lg-n4">
                {/* <h6 className="hero-meta text-uppercase text-primary mb-3">
                  Largest nft marketplace
                </h6> */}
                <h1 className="hero-title">
                  Explore Thousands of Digital Arts and Collectibles
                </h1>
                <ul className="list-item list-item-icon list-item-hero">
                  <li>
                    <span className="ni ni-check icon icon-circle icon-wbg icon-xs"></span>{" "}
                    Create, Buy, Sell and Earn with NFTs
                  </li>
                  <li>
                    <span className="ni ni-check icon icon-circle icon-wbg icon-xs"></span>{" "}
                    Faster and cheaper fees under $1
                  </li>
                  <li>
                    <span className="ni ni-check icon icon-circle icon-wbg icon-xs"></span>{" "}
                    Stake your earnings and earn more.
                  </li>
                </ul>
                <p className="mb-2">
                  Nifty Row is revolutionizing the art market with the
                  blockchain by eliminating the issues of authenticity,
                  counterfeits, trust and provenance of art.
                </p>
                <ul className="btns-group hero-btns">
                  <li>
                    <a href="../marketplace" className="btn btn-lg btn-dark">
                      Explore
                    </a>
                  </li>
                  <li>
                    <a href="../create" className="btn btn-lg btn-outline-dark">
                      Create
                    </a>
                  </li>
                  {/* <TestForm /> */}
                </ul>
              </div>
            </div>
          </div>
          <section class="section-space how-it-work-section">
              <div class="container">
                  <div class="section-head text-center">
                      <h2 class="mb-3">Create, Auction, and Exchange NFTs</h2>
                      <p>Welcome to our NFT Marketplace Platform powered by Casper Blockchain!.</p>
                  </div>
                  <div class="row g-gs justify-content-center">
                      <div class="col-10 col-sm-6 col-md-6 col-lg-3">
                          <div class="card-htw text-center">
                              <span class="icon ni ni-wallet icon-lg icon-circle shadow-sm icon-wbg mx-auto mb-4 text-primary"></span>
                              <h4 class="mb-3">Set up your wallet</h4>
                              <p class="card-text-s1">Install your wallet from <a href="https://www.casperwallet.io/" target="_blank" className="btn-link">www.casperwallet.io</a>, connect it to Niftyrow by clicking the connect wallet button at the top.</p>
                          </div>
                      </div>
                      {/* <div class="col-10 col-sm-6 col-md-6 col-lg-3">
                          <div class="card-htw text-center">
                              <span class="icon ni ni-setting icon-lg icon-circle shadow-sm icon-wbg mx-auto mb-4 text-danger"></span>
                              <h4 class="mb-3">Set Up your Profile</h4>
                              <p class="card-text-s1">Click <a href="#" class="btn-link">My Collections</a> and set up your collection. Add social links, a description.</p>
                          </div>
                      </div>`` */}
                      <div class="col-10 col-sm-6 col-md-6 col-lg-3">
                          <div class="card-htw text-center">
                              <span class="icon ni ni-camera icon-lg icon-circle shadow-sm icon-wbg mx-auto mb-4 text-info"></span>
                              <h4 class="mb-3">Add your NFTs</h4>
                              <p class="card-text-s1">Upload your work (image, video, audio, or 3D art), add a title, symbol, description and other neccessary details.</p>
                          </div>
                      </div>
                      <div class="col-10 col-sm-6 col-md-6 col-lg-3">
                          <div class="card-htw text-center">
                              <span class="icon ni ni-money icon-lg icon-circle shadow-sm icon-wbg mx-auto mb-4 text-success"></span>
                              <h4 class="mb-3">List them for Auction</h4>
                              <p class="card-text-s1">Set up Auction Dates, starting price and let others bid on your NFts.</p>
                          </div>
                      </div>
                  </div>
              </div>
          </section>
          <section class="category-section section-space bg-gray">
              <div class="container">
                  <div class="section-head text-center">
                      <h2 class="mb-3">Browse by category</h2>
                      {/* <p>This is just a simple text made for this unique and awesome template, you can replace it with any text. It is a long established fact.</p> */}
                  </div>
                  <div class="row g-gs">
                      <div class="col-lg-4 col-6 col-md-4">
                          <a href="/assets/artworks" class="card card-cat h-100 text-center text-purple ">
                              <div class="card-body card-body-s1">
                                  <span class="icon ni ni-camera mb-3 mx-auto icon-circle icon-wbg icon-lg"></span>
                                  <h5 class="card-cat-title">Artwork</h5>
                              </div>
                          </a>
                      </div>
                      <div class="col-lg-4 col-6 col-md-4">
                          <a href="/assets/music" class="card card-cat h-100 text-center text-blue">
                              <div class="card-body card-body-s1">
                                  <span class="icon ni ni-music mb-3 mx-auto icon-circle icon-wbg icon-lg"></span>
                                  <h5 class="card-cat-title">Music</h5>
                              </div>
                          </a>
                      </div>
                      <div class="col-lg-4 col-6 col-md-4">
                          <a href="assets/movies" class="card card-cat h-100 text-center text-yellow">
                              <div class="card-body card-body-s1">
                                  <span class="icon ni ni-video mb-3 mx-auto icon-circle icon-wbg icon-lg"></span>
                                  <h5 class="card-cat-title">Movies</h5>
                              </div>
                          </a>
                      </div>
                      {/* <div class="col-lg-3 col-6 col-md-4">
                          <a href="#" class="card card-cat h-100 text-center text-cyan">
                              <div class="card-body card-body-s1">
                                  <span class="icon ni ni-setting mb-3 mx-auto icon-circle icon-wbg icon-lg"></span>
                                  <h5 class="card-cat-title">Utility</h5>
                              </div>
                          </a>
                      </div> */}
                  </div>
              </div>
          </section>
          <section class="subscibe-section section-space-sm">
              <div class="container">
                  {/* <div class="join-form-wrap">
                      <div class="row g-gs align-items-center">
                          <div class="col-lg-3"><h3 class="form-title">Join Our Newsletter</h3>
                          </div>
                          <div class="col-lg-3 col-md-4">
                              <input class="form-control form-control-s1" type="text" name="name" placeholder="Enter name" />
                          </div>
                          <div class="col-lg-3 col-md-4">
                              <input class="form-control form-control-s1" type="text" name="email" placeholder="Enter email" />
                          </div>
                          <div class="col-lg-3 col-md-4">
                              <a href="#" class="btn btn-dark d-md-block">Subscribe Now</a>
                          </div>
                      </div>
                  </div> */}
              </div>
          </section>
        </div>
      </div>
      {/* <Mint /> */}
      <Footer />
    </>
  );
}
