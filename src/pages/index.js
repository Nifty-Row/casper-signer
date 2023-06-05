/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
// import Mint from "./components/mint";
import Header from "./components/Header";
import Footer from "./components/Footer";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <>
      <Header />
      <div className="hero-wrap hero-wrap-4">
        <div className="container">
          <div className="row align-items-center flex-lg-row-reverse justify-lg-content-center">
            <div className="col-lg-6 col-sm-9">
              <div className="row gx-4">
                <div className="col-xl-8">
                  <div className="card card-s2">
                    <div className="card-image">
                      <img
                        src="../assets/images/thumb/nft-lg4.jpg"
                        alt=""
                        className="card-img-top"
                      />
                    </div>
                    <div className="card-body">
                      <h5 className="card-title text-truncate">
                        <a href="product-details-v1.html">
                          Rendering by the Water
                        </a>
                      </h5>
                      <div className="card-author d-flex align-items-center">
                        <span className="me-1 card-author-by">By</span>
                        <a href="../" className="author-link">
                          RukiStudio
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-xl-4 d-xl-block d-none">
                  <div className="card card-s2">
                    <div className="card-image">
                      <img
                        src="../assets/images/thumb/nft20.jpg"
                        alt=""
                        className="card-img-top"
                      />
                    </div>
                    <div className="card-body">
                      <h5 className="card-title text-truncate">
                        <a href="product-details-v1.html">
                          Operation Jade Fury
                        </a>
                      </h5>
                      <div className="card-author d-flex align-items-center">
                        <span className="me-1 card-author-by">By</span>
                        <a href="author.html" className="author-link">
                          CanvaNetwork
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="card card-s2">
                    <div className="card-image">
                      <img
                        src="../assets/images/thumb/nft21.jpg"
                        alt=""
                        className="card-img-top"
                      />
                    </div>
                    <div className="card-body">
                      <h5 className="card-title text-truncate">
                        <a href="product-details-v1.html">
                          One Tribe Black Edition
                        </a>
                      </h5>
                      <div className="card-author d-flex align-items-center">
                        <span className="me-1 card-author-by">By</span>
                        <a href="author.html" className="author-link">
                          ZeniconStudio
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6 col-sm-9">
              <div className="hero-content pt-lg-0 pb-0 mt-lg-n4">
                {/* <h6 className="hero-meta text-uppercase text-primary mb-3">
                  largest nft marketplace
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
                <p>
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
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <Mint /> */}
      <Footer />
    </>
  );
}
