/* eslint-disable @next/next/no-html-link-for-pages */
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import {WalletService} from "../../utils/WalletServices";
import {truncateKey} from "../../utils/generalUtils";
import swal from "sweetalert";
import { Signer } from "casper-js-sdk";

const Header = () => {
  const [publicKey, setPublicKey] = useState("");
  const [signerConnected, setSignerConnected] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setTimeout(async () => {
      try {
        const connected = await WalletService.isSiteConnected();
        // swal("Info","Is site connected ? :"+connected,"info");
        setSignerConnected(connected);
      } catch (err) {
        swal("Attention",err.message,"warning");
        console.log(err);
      }
    }, 100);

    const checkSignerConnection = async () => {
      try {
        if (signerConnected) setActiveKey(await WalletService.getActivePublicKey());
        const publicKeyHex = await WalletService.getActivePublicKey();
        setPublicKey(publicKeyHex);
      } catch (error) {
        setError(
          "There was an error connecting to the Casper Wallet. Please make sure you have the Casper Wallet installed and refresh the page before trying again."
        );
      }
    };
    checkSignerConnection();
  }, [signerConnected]);

  const handleDisconnect = async () => {
    WalletService.disconnect().then(() => {
      const router = require("next/router").default;
      router.push("/");
    });
  };


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
                  src="../../casperSigner-icon.svg"
                  alt="logo"
                  class="card-media-img flex-shrink-0 me-0 mb-3"
                />
                <img
                  className="logo-light logo-img"
                  src="../../NiftyRow-logo-dark.png"
                  alt="logo"
                />
              </a>
            </div>
            <div class="header-mobile-action">
    <div class="header-search-mobile dropdown me-2">
        <a class="icon-btn" href="#" data-bs-toggle="dropdown"><em class="ni ni-search"></em></a>
        <div class="dropdown-menu dropdown-menu-end card-generic">
            <div class="input-group">
                <input type="search" class="form-control form-control-s1" placeholder="Search item here..." /><a href="#" class="btn btn-sm btn-outline-secondary"><em class="ni ni-search"></em></a>
            </div>
        </div>
    </div>
    <div class="header-mobile-user-menu dropdown me-2">
        <button type="button" class="icon-btn" data-bs-toggle="dropdown" aria-expanded="false"><em class="ni ni-user"></em></button>
        <ul class="dropdown-menu card-generic card-generic-s3 dropdown-menu-end mt-2">
            <li><h6 class="dropdown-header">Hello !</h6></li>
            <li>
                <a class="dropdown-item card-generic-item" href="user/profile"><em class="ni ni-user me-2"></em> Profile</a>
            </li>
            <li>
                <a class="dropdown-item card-generic-item" href="user/dashboard"><em class="ni ni-dashboard me-2"></em> Dashboard</a>
            </li>
            
            <li>
                <a href="#" class="dropdown-item card-generic-item theme-toggler" title="Toggle Dark/Light mode"><em class="ni ni-moon me-2"></em> Dark Mode</a>
            </li>
            <li><hr class="dropdown-divider" /></li>
            <li>
                <a class="dropdown-item card-generic-item" href="index.html"><em class="ni ni-power me-2"></em> Logout</a>
            </li>
        </ul>
    </div>
    <div class="header-toggle">
        <button class="menu-toggler"><em class="menu-on menu-icon ni ni-menu"></em><em class="menu-off menu-icon ni ni-cross"></em></button>
    </div>
</div>


            <div className="header-search-form">
              <input
                type="search"
                className="form-control form-control-s1"
                placeholder="Search item here..."
              />
            </div>
            <nav className="header-menu menu nav">
              <ul className="menu-list ms-lg-auto">
                <li className="menu-item ">
                  <a href="../../" className="menu-link text-light">
                    Home
                  </a>
                </li>
                <li className="menu-item">
                  <a href="../../marketplace" className="menu-link text-light">
                    Marketplace
                  </a>
                </li>
                <li className="menu-item has-sub">
                  {/* <a href="#" className="menu-link menu-toggle">
                    Pages
                  </a> */}
                </li>
              </ul>
              <ul className="menu-btns">
                {publicKey === "" && (
                  <li>
                    <a href="../../walletConnect" className="btn btn-info">
                      Connect Wallet
                    </a>
                  </li>
                )}
                {publicKey !== "" && (
                  <li>
                    <a href="../../profile" className="btn btn-primary">
                     Profile {truncateKey(publicKey)}
                    </a>
                  </li>
                )}
                {publicKey !== "" && (
                  <li>
                    <a href="../../create" className="btn btn-success">
                      Mint NFT
                    </a>
                  </li>
                )}
                {/* <li>
                  <a href="../../walletConnect" className="btn btn-light">
                    Connect Wallet
                  </a>
                </li> */}
                {/* <li>
                  <a
                    href="#"
                    className="theme-toggler"
                    title="Toggle Dark/Light mode"
                  >
                    <span>
                      <em className="ni ni-moon icon theme-toggler-show"></em>
                      <em className="ni ni-sun icon theme-toggler-hide"></em>
                    </span>
                    <span className="theme-toggler-text">Dark Mode</span>
                  </a>
                </li> */}
              </ul>
              {publicKey !== "" && (
              <ul class="menu-btns menu-btns-2">
                
                <li class="d-none d-lg-inline-block dropdown">
                    <button type="button" class="icon-btn icon-btn-s1" data-bs-toggle="dropdown"><em class="ni ni-user"></em></button>
                    <ul class="dropdown-menu card-generic card-generic-s3 dropdown-menu-end mt-2">
                        <li><h6 class="dropdown-header">Hello !</h6></li>
                        <li>
                            <a class="dropdown-item card-generic-item" href="../user/profile"><em class="ni ni-user me-2"></em> Profile</a>
                        </li>
                        <li>
                            <a class="dropdown-item card-generic-item" href="../../user/dashboard"><em class="ni ni-dashboard me-2"></em> Dashboard</a>
                        </li>
                       
                        <li>
                            <a href="#" class="dropdown-item card-generic-item theme-toggler" title="Toggle Dark/Light mode"><em class="ni ni-moon me-2"></em> Dark Mode</a>
                        </li>
                        <li><hr class="dropdown-divider" /></li>
                        <li>
                            <a class="dropdown-item card-generic-item" onclick={handleDisconnect}><em class="ni ni-power me-2"></em> Disconnect</a>
                        </li>
                    </ul>
                </li>
                <li class="d-lg-none"><a href="../../WalletConnect" class="btn btn-lg btn-dark">Connect Wallet</a></li>
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
