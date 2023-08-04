import Head from "next/head";
import Image from "next/image";
import axios from "axios";
import { Inter } from "next/font/google";
import React, { useLayoutEffect, useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import NFTCard from "./components/NFTCard";

import { WalletService } from "@/utils/WalletServices";
import { truncateKey } from "@/utils/generalUtils";
import Copier from "./components/Copier";

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
          <div class="hero-wrap sub-header bg-image">
              <div class="container">
                  <div class="hero-content py-0 d-flex align-items-center">
                  <div class="avatar avatar-3 flex-shrink-0"><Image src="/img_405324.png" width={100} height={100} alt="avatar" /></div>
                  <div class="author-hero-content-wrap d-flex flex-wrap justify-content-between ms-3 flex-grow-1">
                      <div class="author-hero-content me-3">
                          <h4 class="hero-author-title mb-1 text-white">{user.fullName}</h4>
                          <p class="hero-author-username mb-1 text-white">@{user.username}</p>
                          <Copier text={activeKey} />
                      </div>
                      <div class="hero-action-wrap d-flex align-items-center my-2">
                          {/* <button type="button" class="btn btn-light">Follow</button>
                          <div class="dropdown ms-3">
                              <a class="icon-btn icon-btn-s1" href="#" data-bs-toggle="dropdown" id="reportDropdown"><em class="ni ni-more-h"></em></a>
                              <ul class="dropdown-menu card-generic p-2 dropdown-menu-end mt-2 card-generic-sm" aria-labelledby="reportDropdown">
                                  <li><a class="dropdown-item card-generic-item" href="#" data-bs-toggle="modal" data-bs-target="#reportModal">Report Page</a></li>
                              </ul>
                          </div> */}
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
                                  <p class="sidebar-text mb-3">
                                      {user.about}
                                  </p>
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
                                          <a href={user.facebook} target="_blank"><span class="ni ni-facebook-f icon"></span>Facebook</a>
                                      </li>
                                      <li>
                                          <a href={user.twitter} target="_blank"><span class="ni ni-twitter icon"></span>Twitter</a>
                                      </li>
                                      <li>
                                          <a href={user.instagram} target="_blank"><span class="ni ni-instagram icon"></span>Instagram</a>
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
                                      <button class="nav-link active" id="on-sale-tab" data-bs-toggle="tab" data-bs-target="#on-sale" type="button" role="tab" aria-controls="on-sale" aria-selected="true">Assets in Auction</button>
                                  </li>
                                  <li class="nav-item" role="presentation">
                                      <button class="nav-link" id="owned-tab" data-bs-toggle="tab" data-bs-target="#owned" type="button" role="tab" aria-controls="owned" aria-selected="false">Assets Won in Auction</button>
                                  </li>
                                  <li class="nav-item" role="presentation">
                                      <button class="nav-link" id="created-tab" data-bs-toggle="tab" data-bs-target="#created" type="button" role="tab" aria-controls="created" aria-selected="false">All Assets</button>
                                  </li>
                              </ul>
                              <div class="gap-2x"></div>
                              <div class="tab-content" id="myTabContent">
                                <div class="tab-pane fade show active" id="on-sale" role="tabpanel" aria-labelledby="on-sale-tab">
                                    <div class="row g-gs">
                                    {userNftsInAuction.map((nft) => (
                                        <NFTCard key={nft.id} nftData={nft} />
                                        ))}
                                    </div>
                                </div>
                                <div class="tab-pane fade" id="owned" role="tabpanel" aria-labelledby="owned-tab">
                                    <div class="row g-gs">
                                    {userOwnedNfts.map((nft) => (
                                        <NFTCard key={nft.id} nftData={nft} />
                                        ))}
                                    </div>
                                </div>
                                <div class="tab-pane fade" id="created" role="tabpanel" aria-labelledby="created-tab">
                                    <div class="row g-gs">
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
