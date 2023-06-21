/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/rules-of-hooks */
import Head from "next/head";
import Image from "next/image";
import { useState, useEffect, useLayoutEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import TestForm from "../components/test";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Some, None } from "ts-results";
import moment from "moment";

import {
  WalletService
} from "@/utils/WalletServices";
import { formatDate, decodeSpecialCharacters, deploySigned} from "@/utils/generalUtils";
import {
  Signer,
  DeployUtil,
  CasperClient,
  Contracts,
  CLPublicKey,
  decodeBase16,
  RuntimeArgs,
  CLString,
  CLValueBuilder,
  CLValue,
  CLMap,
  CLList,
  CLOption,
  CLKey,
  CLByteArray,
  CLU512Type,
  CLU512,
  CLU64,
  CLU32,
  CLBool,
  CLAccountHash,
} from "casper-js-sdk";
import swal from "sweetalert";

export default function NFTDetails() {
  const router = useRouter();
  const { query } = router;
  const [tokenId, setTokenId] = useState(null);
  const [nft, setNFT] = useState(null);
  const [key, setKey] = useState(null);
  const [isOwner, setIsOwner] = useState(null);
  const [owner, setOwner] = useState(null);
  const [bidAmount, setBidAmount] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [minPrice, setMinPrice] = useState(10);
  const [fundAmount, setFundAmount] = useState("1");
  const [user, setUser] = useState(null);
  const [deployHash, setDeployHash] = useState(null);
  const [auctionData, setAuctionData] = useState(null);
  const [bids, setBids] = useState(null);
  

  useEffect(() => {
    WalletService.getActivePublicKey()
    .then(async (data) => {
      if(!data) window.location = "/walletConnect";
      setKey(data);
      try {  
        if (query.tokenId) {
          setTokenId(query.tokenId);
          fetch(`https://shark-app-9kl9z.ondigitalocean.app/api/nft/${query.tokenId}`)
            .then((response) => response.json())
            .then(async (data) => {
              setNFT(data);
              setOwner(data.user);
              setAuctionData(data.auction);
              setBids(data.bids);
              setIsOwner(data.ownerKey === key);
              if(data.auction.deployHash); setDeployHash(data.auction.deployHash);
              if(data.bids); setBids(data.auction.deployHash);
            }).catch((error) => console.error(error));
        }
      } catch (error) {
        swal("Notice",error.message,"warning");
        console.error(error);
      }
      let userData = await getUser(data);
      setUser(userData);
      
    })
    .catch((error) => {
      console.error(error);
      swal({
        title: "Notice",
        text: error.message,
        icon: "warning",
        buttons: {
          confirm: {
            text: "OK",
            value: true,
            visible: true,
            className: "",
            closeModal: true
          }
        }
      })
      .then((value) => {
        if (value) {
          window.location.href = "/walletConnect"; // Replace with the desired URL
        }
      });
      
    });
   
  
  }, [query,key]);
  
  const handleBidAmountChange = (e) => {
    setBidAmount(e.target.value);
  };

  const handleFundAmountChange = (e) => {
    setFundAmount(e.target.value);
  };

  const handleStartTimeChange = (e) => {
    setStartTime(e.target.value);
  };

  const handleEndTimeChange = (e) => {
    setEndTime(e.target.value);
  };
  const handleMinPriceChange = (e) => {
    setMinPrice(e.target.value);
  };

  

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    // Here you can use the bidAmount and fundAmount values to proceed with placing the bid
    console.log("Bid Amount:", bidAmount);
    console.log("Fund Amount:", fundAmount);

    // Call the prepareBidPurseDeploy function with the appropriate values
    swal("Notice", "Preparing Bid ...", "warning");

    let deploy, deployJSON;

    deploy = await prepareBidPurseDeploy(key);
    deployJSON = DeployUtil.deployToJson(deploy);
    let signedDeployJSON;
    const res = await WalletService.sign(JSON.stringify(deployJSON), key);
    if (res.cancelled) {
      swal("Notice","Casper Wallet Signing cancelled","warning");
    } else {
      let signedDeploy = DeployUtil.setSignature(
        deploy,
        res.signature,
        CLPublicKey.fromHex(key)
      );
      const signedDeployJSON = DeployUtil.deployToJson(signedDeploy);

      const backendData = {
        signedDeployJSON: signedDeployJSON,
      };
      try {
        if(signedDeployJSON){
          swal({
            title: "Signing Successful",
            text: "Please wait while we deploy the NFT.",
            icon: "../../../loading.gif",
            buttons: false,
            closeOnClickOutside: false,
            closeOnEsc: false,
          });
          
          // Send to the backend server for deployment
          const response = await axios.post(
            "https://shark-app-9kl9z.ondigitalocean.app/api/auction/deployBidPurse",
            backendData,
            { headers: { "Content-Type": "application/json" } }
          );
          const data = JSON.stringify(response);
          console.log("Sever Response",response);
          return response.data;
        }
      }catch (error) {
        swal("Error!", error.message, "error");
        return false;
      }
     
    }
  };

  const handleDeployAuctionContract = async (e) => {
    e.preventDefault();
    swal({
      title: "Submitting...",
      text: "Please wait while we start your Auction.",
      icon: "info",
      buttons: false,
      closeOnClickOutside: false,
      closeOnEsc: false,
    });
    const deploy = await prepareAuctionDeploy(key);

    // console.log("deploy",JSON.stringify(deploy));
    const deployJSON = DeployUtil.deployToJson(deploy);
    // console.log(deployJSON)
    try {
      const res = await WalletService.sign(JSON.stringify(deployJSON), key);
      if (res.cancelled) {
        swal("Notice","Casper Wallet Signing cancelled","warning");
      } else {
        let signedDeploy = DeployUtil.setSignature(
          deploy,
          res.signature,
          CLPublicKey.fromHex(key)
        );
        const signedDeployJSON = DeployUtil.deployToJson(signedDeploy);
        
        const backendData = {
          signedDeployJSON: signedDeployJSON,
          nftId:nft.id,
          tokenId:nft.tokenId,
          startDate: startTime,
          endDate: endTime,
          minimumPrice: minPrice,
          deployerKey: key,
        };
        
        console.log("before deploy",signedDeployJSON);
       
        try {
          if(signedDeployJSON){
            swal({
              title: "Signing Successful",
              text: "Please wait while we deploy the NFT.",
              icon: "../../../loading.gif",
              buttons: false,
              closeOnClickOutside: true,
              closeOnEsc: false,
            });
            if(!axios) alert("Axios is not present");
            // Send to the backend server for deployment
            const response = await axios.post(
              "https://shark-app-9kl9z.ondigitalocean.app/api/auction/deployAuction",
              backendData,
              { headers: { "Content-Type": "application/json" } }
            );
            const data = JSON.stringify(response);
            console.log("Sever Response",response);
            if(response.data){
              swal({
                title: "Saving Private Auction Contract",
                text: "Please wait while we save the Contract.",
                icon: "info",
                buttons: false,
                closeOnClickOutside: true,
                closeOnEsc: false,
              });
              try {
                const response = await axios.post(
                  "https://shark-app-9kl9z.ondigitalocean.app/api/auction/startAuction",
                  backendData,
                  { headers: { "Content-Type": "application/json" } }
                );
                if(response.data){
                  setAuctionData(response.data);
                  swal("Success","Auction Contract Deployed & Saved Succesfully","success")
                }
              } catch (error) {
                swal("Error!", "Sorry, "+error.message, "error");
                console.log(error);
              }

            }
          }
        }catch (error) {
          swal("Error!", "Sorry, "+error.message, "error");
          console.log(error);
        }
       
      }
    } catch (err) {
      alert("Error: " + err);
      console.log(err);
    }
  };

  async function handleFinalize(){
    const contract = new Contracts.Contract();
    contract.setContractHash(auctionData.contractHash);

    const deploy = contract.callEntrypoint(
      "finalize",
      RuntimeArgs.fromMap({
        
      }),
      CLPublicKey.fromHex(key),
      "casper-test",
      "30000000000"
    );

    const deployJSON = DeployUtil.deployToJson(deploy);
    try {
      const res = await WalletService.sign(JSON.stringify(deployJSON), key);
      if (res.cancelled) {
        swal("Notice","Casper Wallet Signing cancelled","warning");
      } else {
        let signedDeploy = DeployUtil.setSignature(
          deploy,
          res.signature,
          CLPublicKey.fromHex(key)
        );
        const signedDeployJSON = DeployUtil.deployToJson(signedDeploy);
        
        const backendData = {
          signedDeployJSON: signedDeployJSON,
        };
        
        try {
          if(signedDeployJSON){
            swal({
              title: "Signing Successful",
              text: "Please wait while we finalize the auction.",
              icon: "../../../loading.gif",
              buttons: false,
              closeOnClickOutside: false,
              closeOnEsc: false,
            });
            const response = await axios.post(
              "https://shark-app-9kl9z.ondigitalocean.app/api/nft/deploySigned",
              backendData,
              { headers: { "Content-Type": "application/json" } }
            );
            const data = JSON.stringify(response.data);
            swal("Success",data,"success");
            return response.data;
          }
        }catch (error) {
          swal("Error!", "Error here"+error.message, "error");
          console.log(error);
          return false;
        }
       
      }
    } catch (err) {
      alert("Error: " + err);
      console.log(err);
    }
}

  if (!nft) {
    return <div>Loading...</div>;
  }

  const prepareAuctionDeploy = async (key) => {
    const Key = CLPublicKey.fromHex(key);
    const caskNFTPackageHash =
      "6cde257852d7fcb0dd6b86dd3af612f5d3bf0f333ee16e69e2cde2954fb3bad2"; // nft token hash //cvcv_contract_package_hash

    const bufferedHash = Uint8Array.from(Buffer.from(caskNFTPackageHash, "hex"));

    const token_contract_hash = new CLKey(new CLByteArray(bufferedHash));
    //public key of recipient
    const ownerKey = nft.ownerKey; //jdk2 //public_key_of_account1

    const hashedOwnerKey = new CLAccountHash(
      CLPublicKey.fromHex(ownerKey).toAccountHash()
    );

    const recipient = new CLKey(hashedOwnerKey);

    const mintedTokenId = new CLString(tokenId);
    const token_ids = new CLList([mintedTokenId]);

    //public key of _____ signer wallet
    const deployKey = key; //public_key_of_main_account

    const hashedDeployKey = new CLAccountHash(
      CLPublicKey.fromHex(deployKey).toAccountHash()
    );
    const beneficiary_account = new CLKey(hashedDeployKey);

    const starting_price = new CLOption(None, new
      CLU512Type()); 

    const reserve_price = new CLU512(minPrice);

    const token_id = new CLString(tokenId);

    const currentTimestamp = Date.now(); // Get the current timestamp in milliseconds


    // Convert user-provided start and end times to timestamps
    const startTimestamp = moment(startTime).valueOf().toString();
    const endTimestamp = moment(endTime).valueOf().toString();

    // Calculate the cancellation timestamp by adding a duration to the current timestamp
    const cancellationDuration = 24 * 60 * 60 * 1000; // Example duration of 12 hours
    const cancellationTimestamp = currentTimestamp + cancellationDuration;
    console.log("Time Stamp",startTimestamp.toString());
    console.log("Cancellation Time",cancellationTimestamp.toString());
    console.log("End Time",endTimestamp.toString());
    // Create CLU64 objects using the calculated timestamps
    const start_time = new CLU64(startTimestamp); // Unix timestamp based on user-provided start time
    const cancellation_time = new CLU64(cancellationTimestamp.toString()); // Unix timestamp based on calculated cancellation time
    const end_time = new CLU64(endTimestamp); // Unix timestamp based on user-provided end time

    const format = new CLString("ENGLISH");
    const kyc_package_has =
      "a2d24badef6020572260d05a180663e631d1147390bd61d981df8ab2496fa91b";

    const hex4 = Uint8Array.from(Buffer.from(kyc_package_has, "hex"));

    const kyc_package_hash = new CLKey(new CLByteArray(hex4));

    const name = new CLString("Auction");

    const bidder_count_cap = new CLOption(Some(new CLU64("5")));
    const auction_timer_extension = new CLOption(
      Some(new CLU64("123"))
    );
    const minimum_bid_step = new CLOption(Some(new CLU512("5")));
    const hexString5 =
      "268e98a4faf44865080eaba8bc88b07f8ae870575d100eb611d64c4f518d7f85";

    const marketplace_account = new CLByteArray(
      Uint8Array.from(Buffer.from(hexString5, "hex"))
    );

    const marketplace_commission = new CLU32("200000");
    const has_enhanced_nft = new CLBool(false);
    const deployParams = new DeployUtil.DeployParams(
      CLPublicKey.fromHex(key),
      "casper-test",
      1,
      1800000
    );

    let args = RuntimeArgs.fromMap({
      token_contract_hash: token_contract_hash,
      token_ids: token_ids,
      beneficiary_account: beneficiary_account,
      starting_price: starting_price,
      reserve_price: reserve_price,
      token_id: token_id,
      start_time: start_time,
      cancellation_time: cancellation_time,
      end_time: end_time,
      format: format,
      kyc_package_hash: kyc_package_hash,
      name: name,
      bidder_count_cap: bidder_count_cap,
      auction_timer_extension: auction_timer_extension,
      minimum_bid_step: minimum_bid_step,
      marketplace_account: marketplace_account,
      marketplace_commission: marketplace_commission,
      has_enhanced_nft: has_enhanced_nft,
    });
    
    // console.log("args",args);
    // alert(JSON.stringify(Object.entries(args)));
    let lock_cspr_moduleBytes;
    await fetch("/casper-private-auction-installer.wasm")
      .then((response) => response.arrayBuffer())
      .then((bytes) => (lock_cspr_moduleBytes = new Uint8Array(bytes)));

    // console.log("lock_cspr_moduleBytes",lock_cspr_moduleBytes);  
    const session = DeployUtil.ExecutableDeployItem.newModuleBytes(
      lock_cspr_moduleBytes,
      args
    );

    // console.log("session",session);
    // return;
    try{
     let ddeploy = DeployUtil.makeDeploy(
        deployParams,
        session,
        DeployUtil.standardPayment(300000000000)
      );
      // console.log("deploy",ddeploy);
      // return;
      return ddeploy;
    }catch(e){
      console.log(e);
    }
    
  };
  
  const prepareBidPurseDeploy = async (key) => {
    const Key = CLPublicKey.fromHex(key);
    const deployParams = new DeployUtil.DeployParams(
      Key,
      "casper-test",
      1,
      20000000
    );

    let args = [];
    const amount = new CLU512(bidAmount * 1e9);
    // const auction_contract =
    const auction_contract_string =
      "3323eb2707533952c7ef758924622f95f8358ee88c4987f14ded307cef1f87cd";

    const auction_contract_hex = Uint8Array.from(
      Buffer.from(auction_contract_string, "hex")
    );

    // const auction_contract_hash = new CLKey(
    //   new CLByteArray(auction_contract_hex)
    // );
    const auction_contract_hash = new CLByteArray(auction_contract_hex); //

    const purseName = "BidderPurse1";
    const purse_name = new CLString(purseName);

    args = RuntimeArgs.fromMap({
      amount: amount,
      auction_contract: auction_contract_hash,
      purse_name: purse_name,
    });

    let lock_cspr_moduleBytes;
    await fetch("/bid-purse.wasm")
      .then((response) => response.arrayBuffer())
      .then((bytes) => (lock_cspr_moduleBytes = new Uint8Array(bytes)));

    const session = DeployUtil.ExecutableDeployItem.newModuleBytes(
      lock_cspr_moduleBytes,
      args
    );

    return DeployUtil.makeDeploy(
      deployParams,
      session,
      DeployUtil.standardPayment(15000000000)
    );
  };
  const verifyAuction = async(e) => {
    e.preventDefault();
    swal({
      title: "Submitting...",
      text: "Please wait while we verify your Auction.",
      icon: "info",
      buttons: false,
      closeOnClickOutside: true,
      closeOnEsc: false,
    });
    try {
      const response = await fetch(`https://shark-app-9kl9z.ondigitalocean.app/api/nft/confirmDeploy/${deployHash}`);
      const data = await response.json();
      // alert(JSON.stringify(data));
      console.log(data.Success);
      if(data.Success){
        getHashes(deployHash).then(async (data) => {
          console.log("Hashes",data);
          if(data.hashes){
            updateAuctionHashes(data.hashes).then((data)=> {
              setAuctionData(data);
            })
          }
        });
      }
      return data;
    } catch (error) {
      console.error(error);
      return null;
    }
    
  }

  async function prepareAuctionInitDeploy(publicKey){
      const contract = new Contracts.Contract();
      contract.setContractHash(auctionData.contractHash);
  
      const C_hash = auctionData.contractHash.substring(5);
      const hexC_hash = Uint8Array.from(Buffer.from(C_hash, "hex"));
      const auction_contract_hash = new CLKey(new CLByteArray(hexC_hash));
      
      const P_hash = auctionData.packageHash.substring(5);
      const hexP_hash = Uint8Array.from(Buffer.from(P_hash, "hex"));
      const package_contract_hash = new CLKey(new CLByteArray(hexP_hash));
  
      const deploy = contract.callEntrypoint(
        "init",
        RuntimeArgs.fromMap({
          auction_contract_hash: auction_contract_hash,
          auction_package_hash: package_contract_hash,
        }),
        CLPublicKey.fromHex(publicKey),
        "casper-test",
        "30000000000"
      );
      return deploy;
    }

  const startAuction = async(e) => {
    e.preventDefault();
    swal({
      title: "Submitting...",
      text: "Please wait while we start your Auction.",
      icon: "info",
      buttons: false,
      closeOnClickOutside: true,
      closeOnEsc: false,
    });

    const deploy = await prepareAuctionInitDeploy(key);
  
    const deployJSON = DeployUtil.deployToJson(deploy);

    try {
      const res = await WalletService.sign(JSON.stringify(deployJSON), key);
      if (res.cancelled) {
        swal("Notice","Casper Wallet Signing cancelled","warning");
      } else {
        let signedDeploy = DeployUtil.setSignature(
          deploy,
          res.signature,
          CLPublicKey.fromHex(key)
        );
        const signedDeployJSON = DeployUtil.deployToJson(signedDeploy);
        
        const backendData = {
          signedDeployJSON: signedDeployJSON,
        };
        console.log("before deploy",signedDeployJSON);
        try {
          if(signedDeployJSON){
            swal({
              title: "Signing Successful",
              text: "Please wait while we deploy the contract.",
              icon: "../../../loading.gif",
              buttons: false,
              closeOnClickOutside: false,
              closeOnEsc: false,
            });
            if(!axios) alert("Axios is not present");
            // Send to the backend server for deployment
            const response = await axios.post(
              "https://shark-app-9kl9z.ondigitalocean.app/api/nft/deploySigned",
              backendData,
              { headers: { "Content-Type": "application/json" } }
            );
            const data = JSON.stringify(response.data);
            swal("Success","Auction Has been initialized Successfully","success");
            console.log("Sever Response",response);
            return response.data;
          }
        }catch (error) {
          swal("Error!", "Error here"+error.message, "error");
          console.log(error);
          return false;
        }
       
      }
    } catch (err) {
      alert("Error: " + err);
      console.log(err);
    }

  }
  const endAuction = async(e) => {
    e.preventDefault();
    
    handleFinalize().then(async (data) => {

    });

  }

  const placeBid = async(e)=>{
    e.preventDefault();

    
  }

  async function getUser(publicKey) {
    try {
      const response = await fetch("https://shark-app-9kl9z.ondigitalocean.app/api/user/userByKey/"+publicKey);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async function updateOwner(newOwnerKey){
    let backendData = {
      newOwnerKey: newOwnerKey,
    };

    try {
      if(signedDeployJSON){
        swal({
          title: "Transfering NFT",
          text: "Please wait while we transfer the NFT to it's new owner.",
          icon: "info",
          buttons: false,
          closeOnClickOutside: false,
          closeOnEsc: false,
        });
        if(!axios) alert("Axios is not present");
        // Send to the backend server for deployment
        const response = await axios.put(
          `https://shark-app-9kl9z.ondigitalocean.app/api/nft/updateOwner/${tokenId}`,
          backendData,
          { headers: { "Content-Type": "application/json" } }
        );
        const data = JSON.stringify(response);
        console.log("Sever Response",response);
        return response.data;
      }
    }catch (error) {
      swal("Error!", "Error here"+error.message, "error");
      console.log(error);
      return false;
    }


  }

  async function addBid(){
    let backendData = {
      bid:bidAmount,
      bidder:key,
      userId:user.id
    }
  }

  async function updateAuctionHashes(hashes){
    let backendData = {
      deployHash:deployHash,
      packageHash:hashes.packageHash,
      contractHash:hashes.contractHash
    };

    try {
      swal({
        title: "Updating Auction",
        text: "Please wait while we update the auction.",
        icon: "info",
        buttons: false,
        closeOnClickOutside: true,
        closeOnEsc: false,
      });
      // Send to the backend server for deployment
      const response = await axios.post(
        "https://shark-app-9kl9z.ondigitalocean.app/api/auction/updateAuction",
        backendData,
        { headers: { "Content-Type": "application/json" } }
      );
      const data = JSON.stringify(response);
      console.log("Sever Response",response);
      swal("Success!", "Auction Verified and Updated!", "success");
      return response.data;
    }catch (error) {
      swal("Error!", "Sorry, "+error.message, "error");
      console.log(error);
      return false;
    }
  }

  async function getHashes(deployHash){
    try {
      const response = await fetch(`https://shark-app-9kl9z.ondigitalocean.app/api/auction/getHashes/${deployHash}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      return null;
    }
  }


  

  return (
    <>
      <Header />
      <section class="item-detail-section mb-4">
        <div class="container">
          <div class="row">
            <div class="col-lg-6">
              <div class="item-detail-content mb-5 mb-lg-0">
                <h1 class="item-detail-title mb-2">{nft.mediaName}</h1>
                <div class="item-detail-meta d-flex flex-wrap align-items-center mb-3">
                  <span class="item-detail-text-meta">
                    Media Type :{" "}
                    <span class="text-primary fw-semibold">
                      {nft.mediaType}
                    </span>
                  </span>
                  <span class="dot-separeted"></span>
                  <span class="item-detail-text-meta">
                    Asset Type : 
                    <span class="text-primary fw-semibold">
                      {nft.assetType}
                    </span>
                  </span>
                  <span class="dot-separeted"></span>
                  <span class="item-detail-text-meta">
                    Asset Symbol:
                    <span class="text-primary fw-semibold">
                      {" "}
                      {nft.assetSymbol}
                    </span>
                  </span>
                </div>
                <p class="item-detail-text mb-4">{decodeSpecialCharacters(nft.description)}</p>
                <div class="item-credits mb-4">
                  <div class="row g-4">
                    <div class="col-xl-6">
                      <div class="card-media card-media-s1">
                        <a
                          href="#"
                          class="card-media-img flex-shrink-0 d-block"
                        >
                          <img
                            src="/img_405324.png"
                            alt="avatar"
                          />
                        </a>
                        <div class="card-media-body">
                          {owner &&(
                              <><a href={`/author/${owner.username}`} class="fw-semibold">
                              @{owner.username}
                            </a><p class="fw-medium small">
                                {owner.category}
                              </p><p class="fw-medium small text-dark">
                                {owner.about}
                              </p>
                              <p class="fw-medium small text-dark">
                                Joined : {formatDate(owner.createdAt)}
                              </p>
                              <div class="dropdown-menu card-generic p-2 keep-open w-100 mt-1">
                                <a href="#" class="dropdown-item card-generic-item">
                                  <em class="ni ni-facebook-f me-2"></em> Facebook
                                </a>
                                <a href="#" class="dropdown-item card-generic-item">
                                  <em class="ni ni-twitter me-2"></em> Twitter
                                </a>
                                <a href="#" class="dropdown-item card-generic-item">
                                  <em class="ni ni-instagram me-2"></em> Instagram
                                </a>
                              </div></>
                          )}
                          
                        </div>
                        
                      </div>
                    </div>
                    <div class="col-xl-6">
                      <div class="card-media card-media-s1">
                        <div class="card-media-body">
                        <div class="item-detail-btns mt-4">
                            <ul class="btns-group d-flex">
                              <li class="flex-grow-1">
                                {nft.inAuction && !isOwner && (
                                  <a
                                    href="#"
                                    data-bs-toggle="modal"
                                    data-bs-target="#placeBidModal"
                                    class="btn btn-dark d-block mb-4"
                                  >
                                    Place a Bid {isOwner}
                                  </a>
                                )}
                                {!nft.inAuction && isOwner && (
                                  <a
                                    href="#"
                                    data-bs-toggle="modal"
                                    data-bs-target="#startAuctionModal"
                                    class="btn btn-dark d-block"
                                  >
                                    Create Private Auction
                                  </a>
                                )}
                                {nft.inAuction && isOwner  && auctionData.contractHash && !auctionData.approve && (
                                  <a
                                    href="#"
                                  onClick={startAuction}
                                    class="btn btn-dark d-block"
                                  >
                                    Start Auction
                                  </a>
                                )}
                                {nft.inAuction && isOwner  && auctionData.contractHash && !auctionData.approve && (
                                  <a
                                    href="#"
                                  onClick={endAuction}
                                    class="btn btn-dark d-block"
                                  >
                                    End Auction
                                  </a>
                                )}
                                {nft.inAuction && isOwner && !auctionData.contractHash && !auctionData.approve && (
                                  <a
                                    href="#"
                                    onClick={verifyAuction}
                                    class="btn btn-info bg-dark-dim d-block"
                                  >
                                    Verify Auction
                                  </a>
                                )}
                              </li>
                              {/* <TestForm /> */}
                              {deployHash && (<li class="flex-grow-1">
                                <div class="dropdown">
                                  <a
                                    href={`https://testnet.cspr.live/deploy/${deployHash}`}
                                    target="_blank"
                                    class="btn bg-dark-dim d-block"
                                  >
                                    Verify on Explorer
                                  </a>
                                  
                                </div>
                              </li>)}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="item-detail-tab">
                  <ul class="nav nav-tabs nav-tabs-s1" id="myTab" role="tablist">
                      <li class="nav-item" role="presentation">
                          <button class="nav-link" id="bids-tab" data-bs-toggle="tab" data-bs-target="#bids" type="button" role="tab" aria-controls="bids" aria-selected="true">Bids</button>
                      </li>
                      {/* <li class="nav-item" role="presentation">
                          <button class="nav-link active" id="owners-tab" data-bs-toggle="tab" data-bs-target="#owners" type="button" role="tab" aria-controls="owners" aria-selected="falsr">Owners</button>
                      </li> */}
                      
                     
                  </ul>
                </div>
                
              </div>
            </div>
            <div class="col-lg-5 ms-auto">
              <div class="item-detail-content">
                <div class="item-detail-img-container item-detail-img-full">
                  <img src={nft.artworkUrl} alt="" class="w-100 rounded-3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div
        class="modal fade"
        id="placeBidModal"
        tabindex="-1"
        aria-hidden="true"
      >
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h4 class="modal-title">Place a Bid</h4>
              <button
                type="button"
                class="btn-close icon-btn"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <em class="ni ni-cross"></em>
              </button>
            </div>
            <div class="modal-body">
              <form onSubmit={handlePlaceBid}>
                <p class="mb-3">
                  You are about to place a bid for{" "}
                  <strong>{nft.mediaName}</strong> 
                  {/* <strong>{nft.artistName}</strong> */}
                </p>
                <div class="mb-3">
                  <label class="form-label">Your bid (CSPR)</label>
                  <input
                    type="text"
                    class="form-control form-control-s1"
                    placeholder="Minimum bid = 20"
                    value={bidAmount}
                    onChange={handleBidAmountChange}
                  />
                </div>
                <div class="mb-3">
                  <label class="form-label">
                    Enter Amount to fund your bid purse
                  </label>
                  <input
                    type="text"
                    class="form-control form-control-s1"
                    value={fundAmount}
                    onChange={handleFundAmountChange}
                  />
                </div>
                {/* ... */}
                <button type="submit" class="btn btn-dark d-block">
                  Place a Bid
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div
        class="modal fade"
        id="startAuctionModal"
        tabindex="-1"
        aria-hidden="true"
      >
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h4 class="modal-title">Start Private Auction Contract</h4>
              <button
                type="button"
                class="btn-close icon-btn"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <em class="ni ni-cross"></em>
              </button>
            </div>
            <div class="modal-body">
              <form onSubmit={handleDeployAuctionContract}>
                <p class="mb-3">
                  You are about to deploy an Auction contract for
                  <strong> {nft.mediaName}</strong>
                  <strong> ({nft.assetSymbol})</strong>
                </p>
                <div class="mb-3">
                  <label class="form-label">Token Id</label>
                  <input
                    type="text"
                    class="form-control form-control-s1"
                    value={nft.tokenId}
                    disabled
                  />
                </div>
                <div class="mb-3">
                  <label class="form-label">Auction Starts</label>
                  <input
                    type="datetime-local"
                    class="form-control form-control-s1"
                    onChange={handleStartTimeChange}
                  />
                </div>
                <div class="mb-3">
                  <label class="form-label">Auction Ends</label>
                  <input
                    type="datetime-local"
                    class="form-control form-control-s1"
                    onChange={handleEndTimeChange}
                  />
                </div>
                <div class="mb-3">
                  <label class="form-label">Enter Min Bid Price(CSPR)</label>
                  <input
                    type="text"
                    class="form-control form-control-s1"
                    value={minPrice}
                    onChange={handleMinPriceChange}
                  />
                </div>
                {/* ... */}
                <button type="submit" class="btn btn-dark d-block float-right">
                  Deploy Auction Contract
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
