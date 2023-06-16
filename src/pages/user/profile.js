import Head from "next/head";
import Image from "next/image";
import axios from "axios";
import { Inter } from "next/font/google";
import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { WalletService } from "@/utils/WalletServices";
import ProfileForm from "../components/ProfileForm";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [userData, setUserData] = useState(null);
  const [activeKey, setActiveKey] = useState();

  useEffect(() => {
    const getUserDataByKey = async () => {
      if (activeKey) {
        try {
          const url = `https://shark-app-9kl9z.ondigitalocean.app/api/user/userByKey/${activeKey}`;
          const response = await axios.get(url); // Remove { activeKey } from axios.get()
          console.log(response.data); // Access response.data to get the actual data
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
          } catch (error) {
            console.error(error);
          }
        }
      }
    };

    getUserDataByKey(); // Call the function to fetch data
  }, [activeKey]);

  if(!userData){
    return (
      <><><Header /><div class="hero-wrap sub-header">
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
      </div><section className="explore-section pt-lg-4">
          <div className="container">
            <div className="filter-box"></div>
            {/* <div className="gap-2x"></div> */}
            <div className="filter-container row g-gs">
              <div className="col-md-12">
                <h4 className="text-danger text-center">Please ensure your wallet is connected to view profile detaails</h4>
                <center><a href="../../walletConnect" class="btn btn-primary btn-lg float-center mt-4">Connect Wallet</a></center>

              </div>
            </div>
          </div>
        </section></><Footer /></>
         
    );
  }

  if(!key){
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
                  Create
                </li>
              </ol>
            </nav>
          </div>
        </div>
      </div>
      <section className="explore-section pt-lg-4">
        <div className="container">
          <div className="filter-box"></div>
          {/* <div className="gap-2x"></div> */}
          <div className="filter-container row g-gs">
            <div className="col-md-12" >
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
                <div class="avatar avatar-3 flex-shrink-0"><Image src="https://cdn.onlinewebfonts.com/svg/img_405324.png" width={100} height={100} alt="avatar" /></div>
                <div class="author-hero-content-wrap d-flex flex-wrap justify-content-between ms-3 flex-grow-1">
                    <div class="author-hero-content me-3">
                        <h4 class="hero-author-title mb-1 text-white">{userData.fullName}</h4>
                        <p class="hero-author-username mb-1 text-white">@{userData.username}</p>
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
                                            <a href="account.html"><em class="ni ni-edit me-2"></em>Edit Profile</a>
                                        </li>
                                        <li>
                                            <a href="payment-methods.html"><em class="ni ni-money me-2"></em>My Assets</a>
                                        </li>
                                        
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-9 ps-xl-5">
                            <div class="user-panel-title-box"><h3>Account Settings</h3></div>
                            <div class="profile-setting-panel-wrap">
                                <ul class="nav nav-tabs nav-tabs-s1 nav-tabs-mobile-size" id="myTab" role="tablist">
                                    <li class="nav-item" role="presentation">
                                        <button
                                            class="nav-link active"
                                            id="account-information-tab"
                                            data-bs-toggle="tab"
                                            data-bs-target="#account-information"
                                            type="button"
                                            role="tab"
                                            aria-controls="account-information"
                                            aria-selected="true"
                                        >
                                            Edit Info
                                        </button>
                                    </li>
                                </ul>
                                <div class="tab-content mt-4" id="myTabContent">
                                    <div class="tab-pane fade show active" id="account-information" role="tabpanel" aria-labelledby="account-information-tab">
                                    <ProfileForm activeKey={activeKey} userData={userData} />


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
