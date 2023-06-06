/* eslint-disable @next/next/no-html-link-for-pages */
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import {
  checkConnection,
  getActiveKeyFromSigner,
  connectCasperSigner,
} from "../../utils/CasperUtils";
import swal from "sweetalert";
import { Signer } from "casper-js-sdk";

const Header = () => {
  const [publicKey, setPublicKey] = useState("");
  const [signerConnected, setSignerConnected] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setTimeout(async () => {
      try {
        const key = await getActiveKeyFromSigner();
        if (key) {
          console.log("Key : " + key);
          setPublicKey(key);
        }
      } catch (err) {
        console.log(err);
        // console.log(Signer);
      }
    }, 100);

    const checkSignerConnection = async () => {
      try {
        if (signerConnected) setPublicKey(await getActiveKeyFromSigner());
      } catch (error) {
        setError(
          "There was an error connecting to the Casper Signer. Please make sure you have the Signer installed and refresh the page before trying again."
        );
      }
    };
    checkSignerConnection();
  }, [signerConnected]);

  return (
    <header className="header-section has-header-main">
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
                  className="logo-light logo-img"
                  src="../../NiftyRow-logo-dark.png"
                  alt="logo"
                />
              </a>
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
                    Explore
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
                    <a href="../../create" className="btn btn-info">
                      Mint NFT
                    </a>
                  </li>
                )}
                {/* <li>
                  <a href="../../walletConnect" className="btn btn-light">
                    Connect Wallet
                  </a>
                </li> */}
                <li>
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
                </li>
              </ul>
            </nav>
            <div className="header-overlay"></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
