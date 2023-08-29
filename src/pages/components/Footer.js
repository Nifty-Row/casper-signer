/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-html-link-for-pages */
/* eslint-disable @next/next/no-img-element */

const Footer = () => {
  return (
    <>
      <footer className="footer-section bg-dark on-dark">
        <div className="container">
          <div className="section-space-sm">
            <div className="row">
              <div className="col-lg-3 col-md-9 me-auto">
                <div className="footer-item mb-5 mb-lg-0">
                  <a href="../../" className="footer-logo-link logo-link">
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
                          <a href="https://app.niftyrow.io/about">About</a>
                        </li>
                        <li>
                          <a href="https://app.niftyrow.io/contact">Contact</a>
                        </li>
                        <li>
                          <a href="#">Careers</a>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="col-lg-8 col-md-4 col-sm-4">
                    <div className="footer-item">
                      <h5 className="mb-4">explore</h5>
                      <ul className="list-item list-item-s1">
                        <li>
                          <a href="../assets/">All Assets</a>
                        </li>
                        <li>
                          <a href="../assets/artworks">Artwork</a>
                        </li>
                        <li>
                          <a href="../assets/music">Music</a>
                        </li>
                        <li>
                          <a href="../assets/movies">Videos</a>
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
            </p>
            <ul className="list-item list-item-s1 list-item-inline">
              <li>
                <a href="../marketplace">Explore</a>
              </li>
              <li>
                <a href="#">Activity</a>
              </li>
              <li>
                <a href="../walletConnect">Wallet</a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
