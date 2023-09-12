/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-html-link-for-pages */
import Head from "next/head";
import Image from "next/image";
import axios from "axios";
import { Inter } from "next/font/google";
import React, { useLayoutEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NFTCard from "@/components/NFTCard";

import { WalletService } from "@/utils/WalletServices";
import { truncateKey } from "@/utils/generalUtils";
import Copier from "@/components/Copier";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [activeKey, setActiveKey] = useState();
  const [user, setUserData] = useState([]);
  const [userNfts, setUserNfts] = useState([]);
  const [userOwnedNfts, setUserOwnedNfts] = useState([]);
  const [userNftsInAuction, setUserNftsInAuction] = useState([]);
  let background = "../../public/assets/images/banner.png";

  useLayoutEffect(() => {
    const getUserDataByKey = async () => {
      if (activeKey) {
        try {
          const url = `https://shark-app-9kl9z.ondigitalocean.app/api/user/userByKey/${activeKey}`;
          const response = await axios.get(url);
          console.log(response.data);
        } catch (error) {
          console.error("Error:", error);
        }
      } else {
        if (WalletService.isSiteConnected()) {
          try {
            const key = await WalletService.getActivePublicKey();
            setActiveKey(key);
            const data = await fetch(
              `https://shark-app-9kl9z.ondigitalocean.app/api/user/userByKey/${key}`
            ).then((response) => response.json());
            setUserData(data);
            getUserNFTs(key);
            console.log("2", data);
          } catch (error) {
            console.error(error);
          }
        }
      }
    };
  
    const getUserNFTs = async (key) => {
      if (key) {
        try {
          const response = await fetch(
            `https://shark-app-9kl9z.ondigitalocean.app/api/nft/nftsByOwner/${key}`
          );
          const data = await response.json();
          setUserNfts(data);
          let res = data.filter((nft) => nft.ownerKey === key && nft.ownerKey!== nft.deployerKey);
          setUserOwnedNfts(res);
          let res2 = data.filter((nft) => nft.ownerKey === key && nft.inAuction);
          setUserNftsInAuction(res2);
      } catch (error) {
          console.error(error);
        }
        
      }
    };
  
    getUserDataByKey();
    getUserNFTs(activeKey);
  }, [activeKey]);
  
  
  return (
    <><><>
          <Header />
          <div className="hero-wrap sub-header bg-image">
              <div className="container">
                  <div className="hero-content py-0 d-flex align-items-center">
                  <div className="avatar avatar-3 flex-shrink-0">
                    <img src="../../img_405324.png" width={100} height={100} alt="avatar" /></div>
                  <div className="author-hero-content-wrap d-flex flex-wrap justify-content-between ms-3 flex-grow-1">
                      <div className="author-hero-content me-3">
                          <h4 className="hero-author-title mb-1 text-white">{user.fullName}</h4>
                          <p className="hero-author-username mb-1 text-white">@{user.username}</p>
                          <Copier text={activeKey} />
                      </div>
                      <div className="hero-action-wrap d-flex align-items-center my-2">
                          {/* <button type="button" className="btn btn-light">Follow</button>
                          <div className="dropdown ms-3">
                              <a className="icon-btn icon-btn-s1" href="#" data-bs-toggle="dropdown" id="reportDropdown"><em className="ni ni-more-h"></em></a>
                              <ul className="dropdown-menu card-generic p-2 dropdown-menu-end mt-2 card-generic-sm" aria-labelledby="reportDropdown">
                                  <li><a className="dropdown-item card-generic-item" href="#" data-bs-toggle="modal" data-bs-target="#reportModal">Report Page</a></li>
                              </ul>
                          </div> */}
                      </div>
                  </div>
              </div>
          </div>
        </div>
          <section className="author-section section-space">
              <div className="container">
                  <div className="row">
                      
                      <div className="col-xl-12 ps-xl-4 mx-auto">
                          <div className="author-items-wrap">
                              <ul className="nav nav-tabs nav-tabs-s1" id="myTab" role="tablist">
                                  <li className="nav-item" role="presentation">
                                      <button className="nav-link active" id="on-sale-tab" data-bs-toggle="tab" data-bs-target="#on-sale" type="button" role="tab" aria-controls="on-sale" aria-selected="true">Assets in Auction</button>
                                  </li>
                                  <li className="nav-item" role="presentation">
                                      <button className="nav-link" id="owned-tab" data-bs-toggle="tab" data-bs-target="#owned" type="button" role="tab" aria-controls="owned" aria-selected="false">Assets Won in Auction</button>
                                  </li>
                                  <li className="nav-item" role="presentation">
                                      <button className="nav-link" id="created-tab" data-bs-toggle="tab" data-bs-target="#created" type="button" role="tab" aria-controls="created" aria-selected="false">All Assets</button>
                                  </li>
                              </ul>
                              <div className="gap-2x"></div>
                              <div className="tab-content" id="myTabContent">
                                <div className="tab-pane fade show active" id="on-sale" role="tabpanel" aria-labelledby="on-sale-tab">
                                    <div className="row g-gs">
                                    {userNftsInAuction.map((nft) => (
                                        <NFTCard key={nft.id} nftData={nft} />
                                        ))}
                                    </div>
                                </div>
                                <div className="tab-pane fade" id="owned" role="tabpanel" aria-labelledby="owned-tab">
                                    <div className="row g-gs">
                                    {userOwnedNfts.map((nft) => (
                                        <NFTCard key={nft.id} nftData={nft} />
                                        ))}
                                    </div>
                                </div>
                                <div className="tab-pane fade" id="created" role="tabpanel" aria-labelledby="created-tab">
                                    <div className="row g-gs">
                                    {userNfts.map((nft) => (
                                        <NFTCard key={nft.id} nftData={nft} />
                                        ))}
                                    </div>
                                </div>
                            </div>

                          </div>
                      </div>
                  </div>
              </div>
          </section>

      </><Footer /></></>
  );
}
