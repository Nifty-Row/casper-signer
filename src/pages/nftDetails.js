/* eslint-disable react-hooks/rules-of-hooks */
import Head from "next/head";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Inter } from "next/font/google";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Signer } from "casper-js-sdk";
import {
  checkConnection,
  getActiveKeyFromSigner,
  connectCasperSigner,
} from "../utils/CasperUtils";

export default function nftDetails() {
  const router = useRouter();
  const { id } = router.query;

  const [nft, setNFT] = useState(null);

  useEffect(() => {
    // API call to fetch NFT details based on the ID
    fetch(`API_ENDPOINT_URL/${id}`)
      .then((response) => response.json())
      .then((data) => setNFT(data))
      .catch((error) => console.error(error));
  }, [id]);

  if (!nft) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>NFT Details</h1>
      <div>
        <Image src={nft.artworkUrl} alt="Artwork" />
        <h2>{nft.mediaName}</h2>
        <p>{nft.description}</p>
        {/* Render additional details based on your NFT data */}
      </div>
    </div>
  );
}
