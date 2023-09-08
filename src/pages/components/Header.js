/* eslint-disable @next/next/no-html-link-for-pages */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @next/next/no-html-link-for-pages */

import { useEffect, useState,useLayoutEffect } from "react";
import { useRouter } from "next/router";
import swal from "sweetalert";
import { truncateKey, handleRefresh } from "@/utils/generalUtils";
import useWalletConnection from "@/hooks/useWalletConnection";
import axios from "axios";

const Header = ({ publicKey, isConnected }) => {
  const [error, setError] = useState("");
  const [activeKey,setActivekey] = useState("");
  const router = useRouter();
  const {
    walletConnected,
    activePublicKey,
    connectWallet,
    disconnectWallet,
    checkWalletConnection,
  } = useWalletConnection();


  useLayoutEffect(() => { 
    if(!walletConnected){
      setActivekey(null);
      checkWalletConnection();
    }
    if(walletConnected && !publicKey && activePublicKey) {
      setActivekey(activePublicKey);
    }else if(walletConnected && publicKey && activePublicKey){
      setActivekey(activePublicKey);
    }
    
  }, [walletConnected,publicKey,activePublicKey]);

  useEffect(()=>{
    // if(publicKey) alert(publicKey);
  },[publicKey])

  const handleDisconnect = async () => {
    swal({
      title: "Disconnect Wallet",
      text: "Are you sure you want to disconnect your wallet?",
      icon: "warning",
      dangerMode: true,
      buttons: {
        cancel: "No",
        confirm: "Yes",
      },
    }).then((confirmed) => {
      // If the user clicks the "Yes" button (confirmed is true), proceed with disconnection
      if (confirmed) {
        disconnectWallet().then(() => {
          swal("Disconnected!", "Wallet Disconnected", "success");
          const router = require("next/router").default;
          router.push("/");
          // handleRefresh();
        });
      }
    });
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const searchQuery = formData.get("search");
    router.push(`/search?search=${searchQuery}`);
  };


  const connectCasperWallet = async () => {
    connectWallet().then(async(data) =>{
      try{
        console.log("connect wallet",data);
        const response = await walletToUser(data);
        if (response == "Success") {
          // const router = require("next/router").default;
          // router.push("/");
          handleRefresh();
        } 
      } catch (error) {
        console.error("Error making API call:", error);
        // Handle the error, e.g., show an error message to the user.
      }
    });
      
    
  };

  async function  walletToUser(key) {
    if(!key) return;
    try {
      const response = await axios.put("https://shark-app-9kl9z.ondigitalocean.app/api/user/addNewWallet", {
        publicKey: key,
      });
      if (response.status === 200) {
        return response.data; // Return a success message or data if needed
      } else {
        swal("Error","Failed to add new wallet.","error");
        return false;
      }
    } catch (error) {
      swal("Error","Failed to add new wallet.","error");
      console.error("Error adding new wallet:", error.message);
      return false;
    }
    return false;
  }



  return (
    <header className="header-section has-header-main mb-0">
      <div className="header-main is-sticky bg-dark ">
        <div className="container">
          <div className="header-wrap">
            <div className="header-logo">
              <a href="/" className="logo-link">
                <img
                  className="logo-dark logo-img"
                  src="../../NiftyRow-logo-dark.png"
                  alt="logo"
                />
                <img
                  src="../../casperlabslogo.png"
                  alt="logo"
                  className="card-media-img flex-shrink-2 casper me-0 mb-3"
                />
                <img
                  className="logo-light logo-img"
                  src="../../NiftyRow-logo-dark.png"
                  alt="logo"
                />
              </a>
            </div>
            <div className="header-mobile-action">
                <div className="header-search-mobile dropdown me-2">
                    <a className="icon-btn" href="#" data-bs-toggle="dropdown"><em className="ni ni-search"></em></a>
                    <div className="dropdown-menu dropdown-menu-end card-generic">
                        <div className="input-group">
                          <form
                            action="/search"
                            onSubmit={handleSearchSubmit}
                            className="d-flex"
                          >
                            <input 
                              type="search" 
                              name="search" 
                              className="form-control form-control-s1" 
                              placeholder="Search item here..." 
                            />
                           <button type="submit" className="btn btn-sm btn-outline-secondary">
                              <em className="ni ni-search"></em>
                            </button>
                            </form>
                        </div>
                    </div>
                </div>
                {activeKey && (
                <div className="header-mobile-user-menu dropdown me-2">
                    <button type="button" className="icon-btn" data-bs-toggle="dropdown" aria-expanded="false">
                      <em className="ni ni-user"></em>
                      </button>
                    <ul className="dropdown-menu card-generic card-generic-s3 dropdown-menu-end mt-2">
                        <li><h6 className="dropdown-header">Hello !</h6></li>
                        <li>
                            <a className="dropdown-item card-generic-item" href="../../user/profile"><em className="ni ni-user me-2"></em> Profile</a>
                        </li>
                        <li>
                            <a className="dropdown-item card-generic-item" href="../../user/dashboard"><em className="ni ni-dashboard me-2"></em> Dashboard</a>
                        </li>
                        <li><hr className="dropdown-divider" /></li>
                        <li>
                            <a className="dropdown-item card-generic-item" href="#"  onClick={handleDisconnect}>
                              <em className="ni ni-power me-2"></em> Disconnect
                            </a>
                        </li>
                    </ul>
                </div>
                )}
                <div className="header-toggle">
                    <button className="menu-toggler"><em className="menu-on menu-icon ni ni-menu"></em><em className="menu-off menu-icon ni ni-cross"></em></button>
                </div>
            </div>
            <div className="header-search-form border-2 d-none d-lg-flex d-flex justify-content-end">
              <form
                  action="/search"
                  onSubmit={handleSearchSubmit}
                  className="d-flex"
                >
                  <input
                    type="search"
                    name="search"
                    className="form-control border-0"
                    placeholder="Search here"
                  />
                  <button type="submit" className="btn btn-sm text-light">
                    <em className="ni ni-search"></em>
                  </button>
                </form>
            </div>
            <nav className="header-menu menu nav">
              <ul className="menu-list ms-lg-auto">
                <li className="menu-item has-sub">
                  <a href="../../" className="menu-link menu-toggle text-light">
                    Assets
                  </a>
                  <div className="menu-sub">
                    <ul className="menu-list">
                      <li className="menu-item">
                        <a href="../../assets/artworks" className="menu-link">Artworks</a>
                      </li>
                      <li className="menu-item">
                        <a href="../../assets/music" className="menu-link">Music</a>
                      </li>
                      <li className="menu-item">
                        <a href="../../assets/movies" className="menu-link">Movies</a>
                      </li>
                    </ul>
                  </div>
                </li>
                <li className="menu-item">
                  <a href="../../marketplace" className="menu-link text-light">
                    Auctions
                  </a>
                 
                </li>
                <li className="menu-item has-sub">
                  {/* <a href="#" className="menu-link menu-toggle">
                    Pages
                  </a> */}
                </li>
              </ul>
              <ul className="menu-btns">
                {!activeKey && (
                  <li>
                    <a href="#" 
                      onClick={connectCasperWallet}
                      className="btn btn-info"
                    >
                      Connect Wallet
                    </a>
                  </li>
                )}
                {activeKey && (
                  <li>
                    <a href="../../user/assets" className="btn btn-primary">
                     Assets {truncateKey(activeKey)}
                    </a>
                  </li>
                )}
                {activeKey && (
                  <li>
                    <a href="../../create" className="btn btn-success">
                      Mint NFT
                    </a>
                  </li>
                )}
                
              </ul>
              {activeKey && (
              <ul className="menu-btns menu-btns-2">
                
                <li className="d-none d-lg-inline-block dropdown">
                    <button type="button" className="icon-btn icon-btn-s1" data-bs-toggle="dropdown"><em className="ni ni-user"></em></button>
                    <ul className="dropdown-menu card-generic card-generic-s3 dropdown-menu-end mt-2">
                        <li><h6 className="dropdown-header">Hello !</h6></li>
                        <li>
                            <a className="dropdown-item card-generic-item" href="../user/profile"><em className="ni ni-user me-2"></em> Profile</a>
                        </li>
                        <li>
                            <a className="dropdown-item card-generic-item" href="../../user/dashboard"><em className="ni ni-dashboard me-2"></em> Dashboard</a>
                        </li>
                        <li><hr className="dropdown-divider" /></li>
                        <li>
                          <a className="dropdown-item card-generic-item" onClick={handleDisconnect}>
                            <em className="ni ni-power me-2"></em> Disconnect
                          </a>
                        </li>

                    </ul>
                </li>
                <li className="d-lg-none"><a href="../../WalletConnect" className="btn btn-lg btn-dark">Connect Wallet</a></li>
              </ul>)}
            </nav>
            <div className="header-overlay"></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
