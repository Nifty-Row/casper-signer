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
            <div className="col-lg-6 col-sm-9 col-md-6">
              <div className="hero-image">
                <img src="../assets/images/thumb/nft-img.png" alt="" className="w-100" />
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
                    <a href="../assets" className="btn btn-lg btn-dark">
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
          <section className="section-space how-it-work-section">
              <div className="container">
                  <div className="section-head text-center">
                      <h2 className="mb-3">Create, Auction, and Exchange NFTs</h2>
                      <p>Welcome to our NFT Marketplace Platform powered by Casper Blockchain!.</p>
                  </div>
                  <div className="row g-gs justify-content-center">
                      <div className="col-10 col-sm-6 col-md-6 col-lg-3">
                          <div className="card-htw text-center">
                              <span className="icon ni ni-wallet icon-lg icon-circle shadow-sm icon-wbg mx-auto mb-4 text-primary"></span>
                              <h4 className="mb-3">Set up your wallet</h4>
                              <p className="card-text-s1">Install your wallet from <a href="https://www.casperwallet.io/" target="_blank" className="btn-link">www.casperwallet.io</a>, connect it to Niftyrow by clicking the connect wallet button at the top.</p>
                          </div>
                      </div>
                      {/* <div className="col-10 col-sm-6 col-md-6 col-lg-3">
                          <div className="card-htw text-center">
                              <span className="icon ni ni-setting icon-lg icon-circle shadow-sm icon-wbg mx-auto mb-4 text-danger"></span>
                              <h4 className="mb-3">Set Up your Profile</h4>
                              <p className="card-text-s1">Click <a href="#" className="btn-link">My Collections</a> and set up your collection. Add social links, a description.</p>
                          </div>
                      </div>`` */}
                      <div className="col-10 col-sm-6 col-md-6 col-lg-3">
                          <div className="card-htw text-center">
                              <span className="icon ni ni-camera icon-lg icon-circle shadow-sm icon-wbg mx-auto mb-4 text-info"></span>
                              <h4 className="mb-3">Add your NFTs</h4>
                              <p className="card-text-s1">Upload your work (image, video, audio, or 3D art), add a title, symbol, description and other neccessary details.</p>
                          </div>
                      </div>
                      <div className="col-10 col-sm-6 col-md-6 col-lg-3">
                          <div className="card-htw text-center">
                              <span className="icon ni ni-money icon-lg icon-circle shadow-sm icon-wbg mx-auto mb-4 text-success"></span>
                              <h4 className="mb-3">List them for Auction</h4>
                              <p className="card-text-s1">Set up Auction Dates, starting price and let others bid on your NFts.</p>
                          </div>
                      </div>
                  </div>
              </div>
          </section>
          <section className="category-section section-space bg-gray">
              <div className="container">
                  <div className="section-head text-center">
                      <h2 className="mb-3">Browse by category</h2>
                      {/* <p>This is just a simple text made for this unique and awesome template, you can replace it with any text. It is a long established fact.</p> */}
                  </div>
                  <div className="row g-gs">
                      <div className="col-lg-4 col-6 col-md-4">
                          <a href="/assets/artworks" className="card card-cat h-100 text-center text-purple ">
                              <div className="card-body card-body-s1">
                                  <span className="icon ni ni-camera mb-3 mx-auto icon-circle icon-wbg icon-lg"></span>
                                  <h5 className="card-cat-title">Artwork</h5>
                              </div>
                          </a>
                      </div>
                      <div className="col-lg-4 col-6 col-md-4">
                          <a href="/assets/music" className="card card-cat h-100 text-center text-blue">
                              <div className="card-body card-body-s1">
                                  <span className="icon ni ni-music mb-3 mx-auto icon-circle icon-wbg icon-lg"></span>
                                  <h5 className="card-cat-title">Music</h5>
                              </div>
                          </a>
                      </div>
                      <div className="col-lg-4 col-6 col-md-4">
                          <a href="assets/movies" className="card card-cat h-100 text-center text-yellow">
                              <div className="card-body card-body-s1">
                                  <span className="icon ni ni-video mb-3 mx-auto icon-circle icon-wbg icon-lg"></span>
                                  <h5 className="card-cat-title">Movies</h5>
                              </div>
                          </a>
                      </div>
                      {/* <div className="col-lg-3 col-6 col-md-4">
                          <a href="#" className="card card-cat h-100 text-center text-cyan">
                              <div className="card-body card-body-s1">
                                  <span className="icon ni ni-setting mb-3 mx-auto icon-circle icon-wbg icon-lg"></span>
                                  <h5 className="card-cat-title">Utility</h5>
                              </div>
                          </a>
                      </div> */}
                  </div>
              </div>
          </section>
          <section className="subscibe-section section-space-sm">
              <div className="container">
                  {/* <div className="join-form-wrap">
                      <div className="row g-gs align-items-center">
                          <div className="col-lg-3"><h3 className="form-title">Join Our Newsletter</h3>
                          </div>
                          <div className="col-lg-3 col-md-4">
                              <input className="form-control form-control-s1" type="text" name="name" placeholder="Enter name" />
                          </div>
                          <div className="col-lg-3 col-md-4">
                              <input className="form-control form-control-s1" type="text" name="email" placeholder="Enter email" />
                          </div>
                          <div className="col-lg-3 col-md-4">
                              <a href="#" className="btn btn-dark d-md-block">Subscribe Now</a>
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
