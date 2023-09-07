/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/rules-of-hooks */
import Head from "next/head";
import Image from "next/image";
import axios from "axios";
import { Inter } from "next/font/google";
import React, { useEffect, useState , useLayoutEffect} from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { WalletService } from "@/utils/WalletServices";
import { truncateKey } from "@/utils/generalUtils";
import ProfileForm from "@/pages/components/ProfileForm";
import Copier from "../components/Copier";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [userData, setUserData] = useState(null);
  const [activeKey, setActiveKey] = useState("");

  useLayoutEffect(() => {
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

  return (
    <>
      <Header />
      {userData &&(<><div className="hero-wrap sub-header bg-image" >
        <div className="container">
            <div className="hero-content py-0 d-flex align-items-center">
                <div className="avatar avatar-3 flex-shrink-0">
                  <img src="/img_405324.png" width={100} height={100} alt={userData?.fullName} loading="lazy" /></div>
                <div className="author-hero-content-wrap d-flex flex-wrap justify-content-between ms-3 flex-grow-1">
                    <div className="author-hero-content me-3">
                        <h4 className="hero-author-title mb-1 text-white">{userData?.fullName}</h4>
                        <p className="hero-author-username mb-1 text-white">@{userData?.username}</p>
                        <Copier text={userData?.publicKey} />
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
        <section className="profile-section section-space">
          <div className="container">
            <div className="row">
                <div className="col-lg-3">
                    <div className="sidebar-head d-flex flex-wrap align-items-center justify-content-between">
                        <h3 className="sidebar-head-title">Account Settings</h3>
                        <div className="sidebar-head-action d-flex align-items-center">
                            <div className="sidebar-drop">
                                <a className="icon-btn menu-toggler-user-open" href="#"><em className="ni ni-menu"></em></a>
                            </div>
                        </div>
                    </div>
                    <div className="sidebar sidebar-user-mobile">
                        <a href="#" className="icon-btn menu-toggler-user-close"><em className="ni ni-cross"></em></a>
                        <div className="sidebar-widget">
                            <ul className="user-nav">
                                <li>
                                    <a href="../../user/dashboard"><em className="ni ni-home-fill me-2"></em>DashBoard</a>
                                </li>
                                <li className="active">
                                    <a href="#" className="text-primary"><em className="ni ni-edit me-2"></em>Edit Profile</a>
                                </li>
                                <li>
                                    <a href="../../user/assets"><em className="ni ni-money me-2"></em>My Assets</a>
                                </li>
                                
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="col-lg-9 ps-xl-5">
                    <div className="user-panel-title-box"><h3>Account Settings</h3></div>
                    <div className="profile-setting-panel-wrap">
                        <ul className="nav nav-tabs nav-tabs-s1 nav-tabs-mobile-size" id="myTab" role="tablist">
                            <li className="nav-item" role="presentation">
                                <button
                                    className="nav-link active"
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
                        <div className="tab-content mt-4" id="myTabContent">
                            <div className="tab-pane fade show active" id="account-information" role="tabpanel" aria-labelledby="account-information-tab">
                            
                            
                            {userData && (<ProfileForm activeKey={activeKey} userData={userData} />)}


                            </div>

                          </div>
                    </div>
                </div>
            </div>
            </div>
        </section></>
      )}
    </>
  );

  if(!activeKey && !userData){
    return (
      <><><Header /><div className="hero-wrap sub-header">
        <div className="container">
          <div className="hero-content text-center py-0">
            <h1 className="hero-title">Nifty Marketplace</h1>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb breadcrumb-s1 justify-content-center mt-3 mb-0">
                <li className="breadcrumb-item">
                  <a href="../../">Home</a>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
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
              <div className="col-md-12 mb-4">
                <h4 className="text-danger text-center">Please ensure your wallet is connected to view profile details</h4>
                <center><a href="../../walletConnect" className="btn btn-primary btn-lg float-center mt-4 mb-4">Connect Wallet</a></center>

              </div>
            </div>
          </div>
        </section></><Footer /></>
         
    );
  }
}
