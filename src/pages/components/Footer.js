/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-html-link-for-pages */
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";

const Footer = () => {
  return (
    <>
      <footer className="footer-section bg-dark on-dark">
        <div className="container">
          <div className="section-space-sm">
            <div className="row">
              <div className="col-lg-3 col-md-9 me-auto">
                <div className="footer-item mb-5 mb-lg-0">
                  <a href="index.html" className="footer-logo-link logo-link">
                    <img
                      className="logo-dark logo-img"
                      src="../NiftyRow-logo-dark.png"
                      alt="logo"
                    />
                    <img
                      className="logo-light logo-img"
                      src="../NiftyRow-logo-dark.png"
                      alt="logo"
                    />
                  </a>
                  <p className="my-4 footer-para">
                    The world's first and largest digital marketplace for unsung
                    arts.
                  </p>
                  <ul className="styled-icon">
                    <li>
                      <a href="#">
                        <em className="icon ni ni-twitter"></em>
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <em className="icon ni ni-facebook-f"></em>
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <em className="icon ni ni-instagram"></em>
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <em className="icon ni ni-pinterest"></em>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="col-lg-8">
                <div className="row g-gs">
                  <div className="col-lg-4 col-md-4 col-sm-4">
                    <div className="footer-item">
                      <h5 className="mb-4">Company</h5>
                      <ul className="list-item list-item-s1">
                        <li>
                          <a href="about-us.html">About</a>
                        </li>
                        <li>
                          <a href="news.html">Blog</a>
                        </li>
                        <li>
                          <a href="contact.html">Contact</a>
                        </li>
                        <li>
                          <a href="about-us.html">Careers</a>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="col-lg-8 col-md-4 col-sm-4">
                    <div className="footer-item">
                      <h5 className="mb-4">Marketplace</h5>
                      <ul className="list-item list-item-s1">
                        <li>
                          <a href="marketplace">All Assets</a>
                        </li>
                        <li>
                          <a href="marketplace/artwork">Artwork</a>
                        </li>
                        <li>
                          <a href="marketplace/music">Music</a>
                        </li>
                        <li>
                          <a href="marketplace/videos">Videos</a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <hr className="bg-white-slim my-0" />
          <div className="copyright-wrap d-flex flex-wrap py-3 align-items-center justify-content-between">
            <p className="footer-copy-text py-2">
              {/* Copyright &copy; 2022 NiftyRow. Template Made by{" "}
    <a
      href="https://themeforest.net/user/softnio/portfolio"
      target="_blank"
    >
      Softnio
    </a> */}
            </p>
            <ul className="list-item list-item-s1 list-item-inline">
              <li>
                <a href="explore.html">Explore</a>
              </li>
              <li>
                <a href="activity.html">Activity</a>
              </li>
              <li>
                <a href="login.html">Login</a>
              </li>
              <li>
                <a href="wallet.html">Wallet</a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
      <script src="../../assets/js/bundle.js"></script>
      <script src="../../assets/js/scripts.js"></script>
    </>
  );
};

export default Footer;
