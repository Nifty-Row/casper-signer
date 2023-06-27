/* eslint-disable @next/next/no-title-in-document-head */
/* eslint-disable @next/next/no-sync-scripts */
/* eslint-disable @next/next/no-css-tags */
import { Html, Head, Main, NextScript } from "next/document";
import Footer from "./components/Footer";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta http-equiv="content-type" content="text/html; charset=utf-8" />
        <meta name="author" content="Sortnio" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        {/* <meta
          name="viewport"
          content="width=device-width,  initial-scale=1.0"
        /> */}
        <meta
          name="description"
          content="NiftyRow By Casper - NFT Marketplace built on the casper network"
        />
        {/* <meta name="keywords" content="nft, crypto, html5 template" /> */}
        <title>Explore | NiftyRow - NFT Marketplace</title>
        <link rel="icon" sizes="16x16" href="../../Nifty-iconsm.png" />
        <link
          rel="stylesheet"
          href="../../assets/css/vendor.bundled751.css?ver=100"
        />
        <link rel="stylesheet" href="../../assets/css/styled751.css" />
        <link rel="stylesheet" href="../../assets/css/introd751.css" />
        <link rel="stylesheet" href="../../assets/css/main.css" />
      </Head>
      <body>
        <div className="page-wrap">
          <NextScript />
        </div>

        <script src="../../assets/js/bundle.js"></script>
        {/* <script src="../../assets/js/scripts.js"></script> */}
      </body>
    </Html>
  );
}
