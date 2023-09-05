/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/rules-of-hooks */
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useLayoutEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Copier from "../components/Copier";
import { Some, None } from "ts-results";
import moment from "moment";

import {
  WalletService
} from "@/utils/WalletServices";
import { formatDate, decodeSpecialCharacters, handleRefresh, truncateKey,getWalletBalance,totesToCSPR} from "@/utils/generalUtils";
import {
  DeployUtil,
  Contracts,
  CLPublicKey,
  RuntimeArgs,
  CLString,
  CLURef,
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

export default function NFTDetails(){
  const router = useRouter();
  
  const [tokenId, setTokenId] = useState("");
  const [nft, setNFT] = useState("");
  const [key, setKey] = useState("");
  const [isOwner, setIsOwner] = useState("");
  const [owner, setOwner] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [minPrice, setMinPrice] = useState(10);
  const [fundAmount, setFundAmount] = useState("1");
  const [highestBid, setHighestBid] = useState("0");
  const [user, setUser] = useState("");
  const [deployHash, setDeployHash] = useState("");
  const [auctionData, setAuctionData] = useState("");
  const [bids, setBids] = useState("");
  const [countdown, setCountdown] = useState('');
  const [auctionStarted, setAuctionStarted] = useState(false);
  const [auctionEnded, setAuctionEnded] = useState(false);
  const [auctionStartDate,setAuctionStartDate] = useState('');
  const [auctionEndDate,setAuctionEndDate] = useState('');
  const [verifiable, setVerifiable] = useState(false);
  const [currentBid, setCurrentBid] = useState("Your Bid must be greater than the the minimum price and the Higest Bid");
  const [canPlaceBid, setCanPlaceBid] = useState(false);
  const [walletBalance, setWalletBalance]= useState("checking balance"); 
  const [auctionStatus, setAuctionStatus] = useState("");
  //load page data
  useEffect(() => {
    const url = window.location.href;
    const id = url.split("/").pop();
    WalletService.getActivePublicKey()
    .then(async (data) => {
      if(!data) window.location = "/walletConnect";
      setKey(data);
      try {  
        if (id) {
          setTokenId(id);
          fetch(`https://shark-app-9kl9z.ondigitalocean.app/api/nft/${id}`)
            .then((response) => response.json())
            .then(async (data) => {
              // alert("Fetched NFT DATA");
              console.log(data);
              setNFT(data);
              if(data.user) setOwner(data.user);
              if(data.auction) setAuctionData(data.auction);
              let isOwner = data.ownerKey === key;
              setIsOwner(isOwner);
              if(data.auction){
                setAuctionStatus(data.auction.status)
                setMinPrice(data.auction.minimumPrice);
                if(data.auction.deployHash !== null) setDeployHash(data.auction.deployHash);
                if(data.auction.bids) setBids(data.auction.bids);
                let bidValues = data.auction.bids.map(bid => bid.bid);
                let highest = Math.max(...bidValues);
                if(highest > 0) setHighestBid(highest);
              }              
              
            }).catch((error) => {
              console.log("Error :",error);
              setNFT(error);
            });
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
   
  
  }, [key]);

  // set auction countdown if auction has not started
  useLayoutEffect(() => {
    
    if (nft.inAuction && auctionData.startDate) {
      const utcStartDateString = auctionData.startDate;
      const utcStartDate = new Date(utcStartDateString);
      const localStartDate = new Date(utcStartDate.getTime() + (utcStartDate.getTimezoneOffset() * 60 * 1000));
  
      const auctionEndDate = new Date(auctionData.endDate);
  
      const interval = setInterval(() => {
        const now = new Date();
        const distance = localStartDate - now;
        const distancee = auctionEndDate - now;
  
        if (distance <= 0 && distancee >= 0) {
          clearInterval(interval);
          if(isOwner && auctionData.status == "pending"){
            setCountdown('Auction is ready to be initialized');
            setAuctionStatus("initialize");
          }else if(!isOwner && auctionData.status == "open"){
            setCountdown('Auction is open for bidding.');
            setAuctionStatus("open");
          }
          else if(isOwner && auctionData.status == "open"){
            setCountdown('Auction is open for bidding.');
            setAuctionStatus("open");
          }
          
          
          setFundAmount(auctionData.minimumPrice);
          setAuctionStarted(true);
        } else if (distancee <= 0 && nft.inAuction) {
          setAuctionStarted(false);
          setCountdown('Auction has Ended for this Asset');
          setAuctionEnded(true);
          clearInterval(interval);
        } else if (distancee <= 0 && auctionData.status === "close" && !nft.inAuction) {
          setAuctionStarted(false);
          setCountdown('NFT not in Auction');
          clearInterval(interval);
        } else {
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
  
          setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        }
  
        const closeTheAuction = async () => {
          //check if auction start date is exhausted and if there are no bids
          if (nft.inAuction && distancee < 0 && auctionData.status === "open" && auctionData.bids.length >= 0) {
            setCountdown('Auction is Closed');
            setAuctionEnded(true);
            clearInterval(interval);
            await closeAuction(auctionData.id); // Call the closeAuction function with auctionData.id as a parameter
          }
        }
  
        closeTheAuction();
      }, 1000);
  
      return () => {
        clearInterval(interval);
      };
    } else if(nft.inAuction === false) {
      alert(nft.inAuction);
      setCountdown('This asset is not yet in auction');
      setAuctionStarted(false);
    }
  }, [nft, auctionData]);
  
  useEffect(() => {
    if (!user) {
      // router.push('/walletConnect');
    }
  }, [user]);
  

  useEffect(() => {
    if(!nft.inAuction) return;

    const updatedTime = moment(auctionData.createdAt);
    const fiveMinutesLater = moment(updatedTime).add(5, 'minutes');
    const now = moment();
    console.log(formatDate(updatedTime));
    console.log(formatDate(fiveMinutesLater));
    console.log(formatDate(now));
    console.log(now.isAfter(fiveMinutesLater));
    if (now.isAfter(fiveMinutesLater)) {
      setVerifiable(true);
    }
  }, [nft,auctionData]);

  useEffect(() => {
    const verifyMint = async () => {
      if (!nft.tokenHash) return;
  
      const createdAtDate = new Date(nft.createdAt);
      const currentTime = new Date();
      
      if (!nft.minted && currentTime - createdAtDate >= 5 * 60 * 1000) {
        try {
          
          const verificationResult = await verifyNFT(nft.tokenHash);
  
          if (verificationResult === "success") {
            // Call updateStatus endpoint
            try {
              const response = await axios.put('https://shark-app-9kl9z.ondigitalocean.app/api/nft/updateStatus', { tokenId: nft.tokenId });
              console.log("Update Status Response:", response.data);
            } catch (updateError) {
              console.error("Update Status Error:", updateError);
            }
  
            // Show success message
            swal("Success", "NFT Mint Verified", "success");
            handleRefresh();
          } else {
            // Show warning message
            console.log(verificationResult);
            swal("Warning", "NFT Mint Not Verified", "warning");
          }
        } catch (error) {
          // Show error message
          swal("Error", "NFT Mint Verification Failed", "error");
        }
      }
    };
  
    verifyMint();
  }, [nft]);
  
  useEffect(() => {
    const checkBalance = async () => {
      if (!key) return;
      try {
        const balance = await getWalletBalance(key);
        console.log("wallet Balance", totesToCSPR(balance));
        setWalletBalance(totesToCSPR(balance || 0)); // Set to 0 if balance is undefined
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
        setWalletBalance(0); // Set to 0 in case of error
      }
    };
    
    if (walletBalance === "checking balance") {
      checkBalance();
    }
  }, [key, walletBalance]);
  
  
  //handle page inputs
  const handleBidAmountChange = (e) => {
    setBidAmount(e.target.value);
  };

  const handleFundAmountChange = (e) => {
    let userbid;
    let amt = e.target.value;
  
    // Check if the entered amount is less than or equal to minPrice + 5
    if (amt <= minPrice + 5) {
      userbid = minPrice + 5;
      setCurrentBid("Your Bid MUST be at least " + userbid + " CSPR.");
      setCanPlaceBid(false);
      return;
    } else {
      // Check if the entered amount is less than highestBid + 5
      if (amt < highestBid + 5) {
        userbid = highestBid + 5;
        setCurrentBid("Your Bid MUST be at least " + userbid + " CSPR.");
        setCanPlaceBid(false);
        return;
      } else {
        // Set the fund amount
        setFundAmount(amt);
        setCurrentBid("");
        setCanPlaceBid(true);
      }
    }
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

  const handleDeployAuctionContract = async (e) => {
    e.preventDefault();
    if(parseInt(walletBalance) < 200){
      swal("Warning",`Wallet Balance of ${walletBalance}CSPR is too low for this mint, please fund your wallet and try again`,"warning");
      return false;
    }
    console.log("balance",walletBalance); 
    swal({
      title: "Submitting...",
      text: "Please wait while we Deploy your Auction.",
      icon: "info",
      buttons: false,
      closeOnClickOutside: false,
      closeOnEsc: false,
    });
    const deploy = await prepareAuctionDeploy(key);
    if(!deploy) return;
    const deployJSON = DeployUtil.deployToJson(deploy);
    try {
      const res = await WalletService.sign(JSON.stringify(deployJSON), key);
      if (res.cancelled) {
        swal("Notice","Casper Wallet Signing was cancelled","warning");
      } else {
        let signedDeploy = DeployUtil.setSignature(
          deploy,
          res.signature,
          CLPublicKey.fromHex(key)
        );
        const signedDeployJSON = DeployUtil.deployToJson(signedDeploy);
        let hash = signedDeployJSON.deploy.hash;
        
        const backendData = {
          signedDeployJSON: signedDeployJSON,
          nftId:nft.id,
          tokenId:nft.tokenId,
          startDate: startTime,
          endDate: endTime,
          minimumPrice: minPrice,
          deployerKey: key,
          deployHash: hash,
          userId:user.id,
        };
        
        console.log("before deploy",backendData);
        // return;
        try {
          if(signedDeployJSON){
            swal({
              title: "Signing Successful",
              text: "Please wait while we deploy the Auction contract.",
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
                  handleRefresh();
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
    const startTimestamp = moment.utc(startTime, 'YYYY-MM-DDTHH:mm').valueOf().toString();
    const endTimestamp = moment.utc(endTime, 'YYYY-MM-DDTHH:mm').valueOf().toString();

    // Calculate the cancellation timestamp by adding a duration to the current timestamp
    const cancellationDuration = 15 * 60 * 1000; // 15 mins after start time
    const cancellationTimestamp = +startTimestamp + +cancellationDuration;
    // Create CLU64 objects using the calculated timestamps
    const start_time = new CLU64(startTimestamp); // Unix timestamp based on user-provided start time
    const cancellation_time = new CLU64(cancellationTimestamp.toString()); // Unix timestamp based on calculated cancellation time
    const end_time = new CLU64(endTimestamp); // Unix timestamp based on user-provided end time
    
     // Check if the conditions are met
    if (startTimestamp <= currentTimestamp) {
      swal("Warning!","Start time "+formatDate(startTime)+" should be in the future.", "warning")
      console.error("Start time should be in the future.");
      return false;
    }

    if (startTimestamp >= cancellationTimestamp) {
      swal("Warning!","Start time should be earlier than cancellation time "+formatDate(cancellationTimestamp)+", at least 15 minutes from now at "+formatDate(cancellationTimestamp), "warning")
      console.error("Start time should be earlier than cancellation time.");
      return false;
    }

    if (cancellationTimestamp >= endTimestamp) {
      swal("Warning!","Cancellation time "+formatDate(cancellationTimestamp)+" should be earlier than end time."+formatDate(endTime), "warning")
      console.error("Cancellation time should be earlier than end time.");
      return false;
    }
    // Validate the start time
    if (startTimestamp - currentTimestamp < 5 * 60 * 1000) {
      swal("Warning!","Start time "+formatDate(startTime)+" should be at least 5 minutes from the current time."+formatDate(currentTimestamp), "warning")
      console.error("Start time "+formatDate(startTime)+" should be at least 5 minutes from the current time."+formatDate(currentTimestamp));
      return false;
    }

    // Validate the end time
    if (endTimestamp - cancellationTimestamp < 15 * 60 * 1000) {
      // End time is less than an hour from the cancellation time
      swal("Warning!","End time "+formatDate(endTime)+" should be at least 15 minutes from "+formatDate(cancellationTimestamp), "warning")
      console.error("End time "+formatDate(endTime)+" should be at least 15 minutes from "+formatDate(cancellationTimestamp));
      return false;
    }
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

    const marketplace_commission = new CLU32("200");
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
        DeployUtil.standardPayment(200000000000)
      );
      // console.log("deploy",ddeploy);
      // return;
      return ddeploy;
    }catch(e){
      console.log(e);
    }
    
  };

  //verify and update auction details if the auction contract deploymnent was a succcess
  const verifyAuction = async() => {
    // e.preventDefault();
    swal({
      title: "Submitting...",
      text: "Please wait while we verify your Auction on the blockchain.",
      icon: "info",
      buttons: false,
      closeOnClickOutside: true,
      closeOnEsc: false,
    });
    try {
      const response = await fetch(`https://shark-app-9kl9z.ondigitalocean.app/api/nft/confirmDeploy/${deployHash}`);
      const data = await response.json();
      
      if(data.status === "success"){
        swal("Success","Private Auction Contract was deployed successfully","success");
        getHashes(deployHash).then(async (data) => {
          console.log("Hashes",data);
          if(data.hashes){
            updateAuctionHashes(data.hashes).then((data)=> {
              setAuctionData(data);
            })
          }
        });
      }else if(data.status === "failure"){
        swal("Verification Failed","Auction Deploy Failed => "+data.Failure.error_message,"error");
        deleteAuction(auctionData.id).then(data =>{
          setAuctionData("");
          let newNFT = nft;
          newNFT.inAuction=false;
          setNFT(newNFT);
          swal("Auction",data+"You can now redeploy another private auction","info");
        })
      }else if(data.status == "pending"){
        swal("Success","Private Auction Contract still deploying","success");
      }
      return data;
    } catch (error) {
      console.error(error);
      return null;
    }
    
  }
  const verifyNFT = async (tokenHash) => {
    swal({
      title: "Submitting...",
      text: "Please wait while we verify your NFT mint status on the blockchain.",
      icon: "info",
      buttons: false,
      closeOnClickOutside: true,
      closeOnEsc: false,
    });
  
    try {
      const response = await axios.get(`https://shark-app-9kl9z.ondigitalocean.app/api/nft/confirmDeploy/${tokenHash}`);
      const data = response.data;
      return data.status;
    } catch (error) {
      console.error(error);
      return null;
    }
  };
  async function deleteAuction(auctionId) {
    try {
      const response = await axios.delete(`https://shark-app-9kl9z.ondigitalocean.app/api/auction/${auctionId}`);
      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error('An error occurred while deleting the auction');
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

  /** Bid Purse and Bid Related Functions */

  const handleBidPurse = async (e) => {
    e.preventDefault();
    if(parseInt(walletBalance) < 200){
      swal("Warning",`Wallet Balance of ${walletBalance}CSPR is too low for this mint, please fund your wallet and try again`,"warning");
      return false;
    }
    console.log("balance",walletBalance); 
    console.log("Fund Amount:", fundAmount);
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
            text: "Please wait while we deploy the Purse contract.",
            icon: "../../../loading.gif",
            buttons: false,
            closeOnClickOutside: true,
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
          if(data){
            let res = await saveBidPurse(signedDeployJSON.deploy.hash);
            addBid(fundAmount).then(data =>{
              console/log("Bidd Added");
              handleRefresh();
            });
          }
          return response.data;
        }
      }catch (error) {
        swal("Error!", error.message, "error");
        return false;
      }
     
    }
  };

  const confirmBidPurse =async(e)=>{
    e.preventDefault();
    swal({
      title: "Verifying Bid Purse",
      text: "Please wait while we verify and update your bid purse.",
      icon: "info",
      buttons: false,
      closeOnClickOutside: true,
      closeOnEsc: false,
    });
    verifyBidPurse(user.purse.deployHash).then(purse => {
      if (purse.uref) {
        let bid = purse.amount.toString().slice(0, -9);
        updatePurseUref(user.purse.id, purse.uref).then(data =>{
          addBid(bid).then(data =>{
            swal("Success","Your Bid has been verified and updated Successfully","success");
            handleRefresh();
          });
        });
      }else{

      }
    })
    .catch(error => {
      swal("Error",error.response.data,"error");
      if(error.response.status === 400) deleteBidPurse(user.purse.id);
      console.error(error);
      // Handle the error here
    });

  }

  const prepareBidPurseDeploy = async (key) => {
    const Key = CLPublicKey.fromHex(key);
    const deployParams = new DeployUtil.DeployParams(
      Key,
      "casper-test",
      1,
      20000000
    );

    let args = [];
    const amount = new CLU512(fundAmount * 1e9);
    // const auction_contract =
    const auction_contract_string = auctionData.contractHash.substring(5);

    const auction_contract_hex = Uint8Array.from(
      Buffer.from(auction_contract_string, "hex")
    );

    // const auction_contract_hash = new CLKey(
    //   new CLByteArray(auction_contract_hex)
    // );
    const auction_contract_hash = new CLByteArray(auction_contract_hex); //

    const purseName = "BidderPurse"+user.id;
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
  
  async function prepareBid(publicKey){
    alert(JSON.stringify(auctionData.contractHash));
      const contract = new Contracts.Contract();
      contract.setContractHash(auctionData.contractHash);
      
      const bid = new CLU512(bidAmount);
      
      const uRef = user.purse.uref;
      const bid_purse =  CLURef.fromFormattedStr(uRef);
  
      const deploy = contract.callEntrypoint(
        "bid",
        RuntimeArgs.fromMap({
          bid: bid,
          bid_purse: bid_purse,
        }),
        CLPublicKey.fromHex(publicKey),
        "casper-test",
        "30000000000"
      );
      return deploy;
  }

  const placeBid = async(e)=>{
    e.preventDefault();
    if(parseInt(walletBalance) < 50){
      swal("Warning",`Wallet Balance of ${walletBalance}CSPR is too low for this mint, please fund your wallet and try again`,"warning");
      return false;
    }
    console.log("balance",walletBalance); 
    let deploy,deployJson;
    deploy = await prepareBid(key);
    swal({
      title: "Submitting...",
      text: "Please wait while we place your bid.",
      icon: "info",
      buttons: false,
      closeOnClickOutside: true,
      closeOnEsc: false,
    });

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
              text: "Please wait while we place your bid.",
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
            swal("Success","Bid has been placed Successfully","success");
            console.log("Sever Response",response);
            await addBid();
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

  async function deleteBidPurse(purseId) {
    try {
      const response = await axios.delete(`https://shark-app-9kl9z.ondigitalocean.app/api/auction/purse/${purseId}`);
      handleRefresh();
      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error('An error occurred while deleting the auction');
    }
  }

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

  const startAuction = async(e) => {
    e.preventDefault();
    if(parseInt(walletBalance) < 50){
      swal("Warning",`Wallet Balance of ${walletBalance}CSPR is too low for this mint, please fund your wallet and try again`,"warning");
      return false;
    }
    console.log("balance",walletBalance); 
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
            await openAuction(auctionData.id);
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
  const endAuction = async (e) => {
    e.preventDefault();
    if(parseInt(walletBalance) < 50){
      swal("Warning",`Wallet Balance of ${walletBalance}CSPR is too low for this mint, please fund your wallet and try again`,"warning");
      return false;
    }
    console.log("balance",walletBalance); 
    // let { highestBidd, highestBidder } = getHighestBid(bids);
    const msg = (bids.length > 0)
    ? "NFT (" + nft.mediaName + ") has been successfully transferred to its new owner."
    : "Unfortunately, there was no bid for this auction.";
    handleFinalize().then(async (data) => {
      closeAuction(auctionData.id).then((data) => {

        swal("Success", data+msg, "success");
      });
    });
  
    // Wait for 15 seconds before calling handleRefresh
    setTimeout(() => {
      // handleRefresh();
    }, 150000);
  };
  
 
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

  function getHighestBid(bids) {
    let highestBid = 0;
    let highestBidder = "";
  
    bids.forEach((bid) => {
      if (bid.bid > highestBid) {
        highestBid = bid.bid;
        highestBidder = bid.bidder;
      }
    });
  
    return {
      highestBid,
      highestBidder,
    };
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

  async function openAuction(auctionId){
    swal({
      title: "Starting the Auction",
      text: "Please wait while we make your private auction open for bids.",
      icon: "info",
      buttons: false,
      closeOnClickOutside: true,
      closeOnEsc: false,
    });
    axios.put(`https://shark-app-9kl9z.ondigitalocean.app/api/auction/openAuction/${auctionId}`).then(response => {
    console.log(response.data); // Process the response data
    swal("Success","Auction Has been opened Successfully","success");
    handleRefresh();
    return response.data
  })
  .catch(error => {
    // Handle error
    console.error(error);
  });
  }

  async function closeAuction(auctionId){
    swal({
      title: "Closing the Auction",
      text: "Please wait while we make your private auction closed from bids.",
      icon: "info",
      buttons: false,
      closeOnClickOutside: true,
      closeOnEsc: false,
    });
    axios.put(`https://shark-app-9kl9z.ondigitalocean.app/api/auction/closeAuction/${auctionId}`).then(response => {
    console.log(response.data); // Process the response data
    // swal("Success","Auction Has been updated ned Successfully","success");
    handleRefresh();
    return response.data
  })
  .catch(error => {
    // Handle error
    console.error(error);
  });
  }

  async function addBid(amount){
    let backendData = {
      bidder:key,
      userId:user.id,
      bid:amount? amount:bidAmount,
      auctionId:auctionData.id,
    }
    swal({
      title: "Saving Bid",
      text: "Please wait while we save your bid.",
      icon: "info",
      buttons: false,
      closeOnClickOutside: true,
      closeOnEsc: false,
    });
    axios.post(`https://shark-app-9kl9z.ondigitalocean.app/api/auction/bidOnAuction`,backendData).then(response => {
    // console.log("bid purse deploy Hash",response.data); // Process the response data
    swal("Success","Bid has been saved Successfully","success");
    return response.data
  })
  .catch(error => {
    // Handle error
    console.error(error);
  });
  }
  async function saveBidPurse(deployHash){
    let backendData = {
      name: "BidderPurse"+user.id,
      deployerKey:key,
      userId:user.id,
      amount:fundAmount,
      deployHash:deployHash,
      uref: "",
    }
    swal({
      title: "Saving Bid Purse",
      text: "Please wait while we create a purse for your bids.",
      icon: "info",
      buttons: false,
      closeOnClickOutside: true,
      closeOnEsc: false,
    });
    axios.post(`https://shark-app-9kl9z.ondigitalocean.app/api/auction/saveBidPurseInfo`,backendData).then(response => {
    console.log("bid purse info",response.data); // Process the response data
    swal("Success","Bid Purse has been Successfully,please proceed to verify it","success");
    return response.data
  })
  .catch(error => {
    // Handle error
    console.error(error);
  });
  }
  
  async function updatePurseUref(purseId, uref) {
    try {
      const response = await axios.put(`https://shark-app-9kl9z.ondigitalocean.app/api/auction/purse/${purseId}`, { uref });
      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error('An error occurred while updating purse uref');
    }
  }
  async function verifyBidPurse(deployHash) {
    try {
      const response = await axios.get(`https://shark-app-9kl9z.ondigitalocean.app/api/auction/getPurseInfo/${deployHash}`);
      console.log(response.data); // Process the response data
      return response.data;
    } catch (error) {
      // Handle error
      swal("Notice", error.message, "error");
      console.error(error);
      // You might want to throw the error or return a specific value in case of an error
      throw error;
    }
  }
  
  const renderMediaImage = () => {
    const defaultImg = "../../default.gif";
  
    if (nft.mediaType === "artwork") {
      return (
        <img
          src={nft.artworkUrl || defaultImg}
          style={nft.minted ? {} : { filter: "grayscale(100%)" }}
          className="w-100 rounded-3"
          alt="art image"
          title={nft.minted ? "" : "nft mint status not yet verified on the blockchain"}
        />
      );
    }
    if (nft.mediaType === "movie") {
      return (
        <img
          src={nft.movieThumbnailUrl || defaultImg}
          style={nft.minted ? {} : { filter: "grayscale(100%)" }}
          className="w-100 rounded-3"
          alt="Movie Thumbnail"
          title={nft.minted ? "" : "nft mint status not yet verified on the blockchain"}
        />
      );
    }
    if (nft.mediaType === "music") {
      return (
        <img
          src={nft.musicThumbnailUrl || defaultImg}
          style={nft.minted ? {} : { filter: "grayscale(100%)" }}
          className="w-100 rounded-3"
          alt="Music Thumbnail"
          title={nft.minted ? "" : "nft mint status not yet verified on the blockchain"}
        />
      );
    }
    return null;
  };
  
  if (typeof nft !== "object" || Object.keys(nft).length === 0) {
    return (
      <>
        <Header />
        <div className="hero-wrap sub-header">
          <div className="container">
            <div className="hero-content text-center py-0">
              <h1 className="hero-title"> NFT</h1>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb breadcrumb-s1 justify-content-center mt-3 mb-0">
                  <li className="breadcrumb-item">
                    <a href="../../">Home</a>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Asset Details
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
        <div className="container mb-4 section-space">
          <div className="row mb-4 mt-2">
            <div className="col-xl-10 mx-auto">
            <div className="alert alert-danger d-flex mb-4" role="alert">
              <svg className="flex-shrink-0 me-3" width="30" height="30" viewBox="0 0 24 24" fill="#ff6a8e">
                <path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20, 12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10, 10 0 0,0 12,2M11,17H13V11H11V17Z"></path>
              </svg>
              <p className="fs-14">No Nft Was Found with details {tokenId} 
                <Link href="/marketplace" className="btn-link"> Go to Marketplace.</Link>
              </p>
            </div>
            </div>
          </div>
        </div>
        
        <Footer />
      </>
    );
  }
  
  return (
    <>
      <Header />
            <div className="hero-wrap sub-header bg-image" style={{minHeight:"200px",maxHeight:"200px"}}>
              <div className="container">
                  <div className="hero-content py-0 d-flex align-items-center">
                  <div className="avatar avatar-3 flex-shrink-0"><Image src="/img_405324.png" width={100} height={100} alt="avatar" /></div>
                  <div className="author-hero-content-wrap d-flex flex-wrap justify-content-between ms-3 flex-grow-1">
                      <div className="author-hero-content me-3">
                          <h4 className="hero-author-title mb-1 text-white">{owner.fullName}</h4>
                          <p className="hero-author-username mb-1 text-white">@{owner.username}</p>
                          <Copier text={owner.publicKey} />
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
      <section className="item-detail-section mb-4">
        <div className="container">
          <div className="row">
            <div className="col-lg-6">
              <div className="item-detail-content mb-5 mb-lg-0">
                <h1 className="item-detail-title mb-2">{nft.mediaName}</h1>
                <div className="item-detail-meta d-flex flex-wrap align-items-center mb-3">
                  <span className="item-detail-text-meta">
                    Media Type :{" "}
                    <span className="text-primary fw-semibold">
                      {nft.mediaType}
                    </span>
                  </span>
                  <span className="dot-separeted"></span>
                  <span className="item-detail-text-meta">
                    Asset Type : 
                    <span className="text-primary fw-semibold">
                      {nft.assetType}
                    </span>
                  </span>
                  <span className="dot-separeted"></span>
                  <span className="item-detail-text-meta">
                    Asset Symbol:
                    <span className="text-primary fw-semibold">
                      {" "}
                      {nft.assetSymbol}
                    </span>
                  </span>
                </div>
                <p className="item-detail-text mb-4">{decodeSpecialCharacters(nft.description)}</p>
                <div className="item-credits mb-4">
                  <div className="row g-4">
                    <div className="col-xl-5">
                      <div className="card-media card-media-s1">
                        
                        <div className="card-media-body">
                          <div className="d-flex">
                            <a
                            href="#"
                            className="card-media-img flex-shrink-0 d-block"
                            >
                            <img
                              src="/img_405324.png"
                              alt="avatar"
                            />
                          </a>
                          {owner && (
                              <>
                              <div>
                              <a href={`/author/${owner.username}`} className="fw-semibold mr-4">
                                @{owner.username}
                              </a><p className="fw-medium small">
                                  {owner.category}
                                </p>
                              </div></>
                            )}
                        </div>
                        {owner &&(
                              <><p className="fw-medium small text-dark">
                                {owner.about}
                              </p>
                              <p className="fw-medium small text-dark">
                                Joined : {formatDate(owner.createdAt)}
                              </p>
                              {/* <div className="dropdown-menu card-generic p-2 keep-open w-100 mt-1">
                                <a href="#" className="dropdown-item card-generic-item">
                                  <em className="ni ni-facebook-f me-2"></em> Facebook
                                </a>
                                <a href="#" className="dropdown-item card-generic-item">
                                  <em className="ni ni-twitter me-2"></em> Twitter
                                </a>
                                <a href="#" className="dropdown-item card-generic-item">
                                  <em className="ni ni-instagram me-2"></em> Instagram
                                </a>
                              </div> */}
                              
                              </>
                          )}
                          
                        </div>
                        
                      </div>
                    </div>
                    <div className="col-xl-7">
                      <div className="card-media card-media-s1">
                        
                        <div className="card-media-body">
                          {nft.inAuction && auctionData.status !== "close" &&(
                              <>
                            <a href="#" className="badge fw-semibold">
                              Auction Start :  <span className="fw-bold text-primary mt-2"> {auctionData ?( formatDate(auctionData.startDate)):(countdown)}</span>
                            </a><hr></hr>
                            <a href="#" className="badge fw-semibold">
                              Auction End :  <span className="fw-bold text-danger"> {auctionData ?( formatDate(auctionData.endDate)):(countdown)}</span>
                            </a><hr></hr>
                            <a href="#" className="badge fw-semibold">
                              Minimum Price :  <span className="fw-bold text-info"> {auctionData ?( auctionData.minimumPrice.toLocaleString("en-Us")):(0)} CSPR </span>
                            </a><hr></hr>
                            <a href="#" className="badge fw-semibold">
                              Highest Bid : <span className="fw-semibold text-info"> {highestBid} CSPR</span> 
                            </a>
                              </>
                          )}
                          
                        </div>
                        
                      </div>
                    </div>
                    <div className="col-xl-12">
                      <div className="card-media card-media-s1">
                        <div className="card-media-body">
                            {/* if nft is in auction */}
                            {nft.inAuction && auctionData ?(
                              <div> 
                                {/* if auction not verified and is owner */}
                                {!auctionData.contractHash && isOwner  ?(
                                  <h4 className="text-danger">Auction not Verified</h4>
                                ):(
                                  null
                                )}
                                {auctionStatus === "open" &&(
                                  <h4 className="text-success">Auction is Open For Bidding <em className="ni ni-check"></em></h4>
                                )}
                                {auctionStatus !== "open" &&(
                                  <><p className="d-flex">Auction Status :  {auctionStatus != "open" && auctionStatus != "initialize" &&("Starts in => ")}   &nbsp;<b> {countdown} </b></p></>
                                )}
                            </div>
                            ):(
                              <div> 
                              <h4>{countdown}</h4>
                            </div>
                            )}
                            
                          <div className="item-detail-btns mt-4">
                            <ul className="btns-group d-flex">
                              <li className="flex-grow-1">
                                {auctionStatus === "open" && nft.inAuction && !isOwner && user.purse !== null && (
                                  <>
                                    {!user.purse || !user.purse.uref && (
                                      <a
                                        href="#"
                                        onClick={confirmBidPurse}
                                        className="btn btn-warning d-block mb-4"
                                      >
                                        Confirm Bid
                                      </a>
                                    )}
                                    <a
                                      href="#"
                                      data-bs-toggle="modal"
                                      data-bs-target="#bidPurseModal"
                                      className="btn btn-dark d-block mb-0"
                                    >
                                      Place  Bid 
                                    </a>
                                  </>
                                )}

                                {auctionStatus== "open" && nft.inAuction && !isOwner && user.purse === null && (
                                  <a
                                    href="#"
                                    data-bs-toggle="modal"
                                    data-bs-target="#bidPurseModal"
                                    className="btn btn-dark d-block "
                                  >
                                    Create Bid Purse
                                  </a>
                                )}
                                {nft.minted && !nft.inAuction && isOwner && (
                                  <a
                                    href="#"
                                    data-bs-toggle="modal"
                                    data-bs-target="#startAuctionModal"
                                    className="btn btn-dark d-block"
                                  >
                                    Create Auction
                                  </a>
                                )}
                                {nft.inAuction && isOwner  && auctionStatus === "initialize" && !auctionEnded && (
                                  <a
                                    href="#"
                                  onClick={startAuction}
                                    className="btn btn-dark text-white d-block"
                                  >
                                    Start Auction
                                  </a>
                                )}
                                {auctionData && isOwner  && auctionEnded && (
                                  <a
                                    href="#"
                                  onClick={endAuction}
                                    className="btn btn-dark d-block"
                                  >
                                    Finalize Auction
                                  </a>
                                )}
                                {nft.inAuction && isOwner && !auctionData.contractHash && !auctionData.approve && (
                                  <div>

                                    {verifiable ? (
                                      <><p>You can now verify private Auction Status.</p><a
                                        href="#"
                                        onClick={verifyAuction}
                                        className="btn btn-info bg-dark-dim d-block"
                                      >
                                        Verify Auction Status
                                      </a></>
                                    ) : (
                                      <><p>Please come back in a few minutes to confirm private auction status.</p><a
                                      href="#"
                                      onClick={() => swal("Please come back in a few minutes to confirm private auction status.")}
                                      className="btn btn-primary text-white d-block"
                                      disabled="disabled"
                                    >
                                      Verify Auction
                                    </a></>
                                    )}
                                  </div>
                                )}
                              </li>
                              {nft.inAuction && deployHash && isOwner && (
                              <li className="flex-grow-1">
                                <div className="dropdown">
                                  <a
                                    href={`https://testnet.cspr.live/deploy/${deployHash}`}
                                    target="_blank"
                                    className="btn bg-dark-dim d-block"
                                  >
                                    View on Explorer
                                  </a>
                                  
                                </div>
                              </li>)}
                              {!nft.minted && isOwner && (
                              <li className="flex-grow-1">
                                <div className="dropdown">
                                  <a
                                    href={`https://testnet.cspr.live/deploy/${nft.tokenHash}`}
                                    target="_blank"
                                    className="btn bg-dark-dim d-block"
                                  >
                                    View NFT on Explorer
                                  </a>
                                  
                                </div>
                              </li>)}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                 
                    {/* <div className="col-xl-12">
                      <div className="card-media card-media-s1">
                        <div className="card-media-body">
                          {shouldShowAuctionStatus ? (
                            <div>
                              {shouldShowAuctionNotVerified && <h4 className="text-danger">Auction not Verified</h4>}
                              {shouldShowOpenAuctionStatus ? (
                                <h4 className="text-info">Auction is Open For Bidding</h4>
                              ) : (
                                <p className="d-flex">Auction Starts in :   &nbsp;<h3> {countdown} </h3></p>
                              )}
                            </div>
                          ) : (
                            <div>
                              <h4>{countdown}</h4>
                            </div>
                          )}
                          
                          <div className="item-detail-btns mt-4">
                            <ul className="btns-group d-flex">
                              <li className="flex-grow-1">
                                {shouldShowConfirmBid && (
                                  <>
                                    {!user.purse || !user.purse.uref && (
                                      <a
                                        href="#"
                                        onClick={confirmBidPurse}
                                        className="btn btn-warning d-block mb-4"
                                      >
                                        Confirm Bid
                                      </a>
                                    )}
                                    <a
                                      href="#"
                                      data-bs-toggle="modal"
                                      data-bs-target="#bidPurseModal"
                                      className="btn btn-dark d-block mb-0"
                                    >
                                      Place  Bid 
                                    </a>
                                  </>
                                )}

                                {shouldShowCreateBidPurse && (
                                  <a
                                    href="#"
                                    data-bs-toggle="modal"
                                    data-bs-target="#bidPurseModal"
                                    className="btn btn-dark d-block "
                                  >
                                    Create Bid Purse
                                  </a>
                                )}
                                
                                {shouldShowCreateAuction && (
                                  <a
                                    href="#"
                                    data-bs-toggle="modal"
                                    data-bs-target="#startAuctionModal"
                                    className="btn btn-dark d-block"
                                  >
                                    Create Auction
                                  </a>
                                )}
                                
                                {shouldShowOpenAuction && (
                                  <a
                                    href="#"
                                    onClick={startAuction}
                                    className="btn btn-success text-white d-block"
                                  >
                                    Open Auction
                                  </a>
                                )}
                                
                                {shouldShowFinalizeAuction && (
                                  <a
                                    href="#"
                                    onClick={endAuction}
                                    className="btn btn-dark d-block"
                                  >
                                    Finalize Auction
                                  </a>
                                )}
                                
                                {shouldShowVerifyAuctionButton && (
                                  <div>
                                    {verifiable ? (
                                      <><p>You can now verify private Auction Status.</p><a
                                        href="#"
                                        onClick={verifyAuction}
                                        className="btn btn-info bg-dark-dim d-block"
                                      >
                                        Verify Auction Status
                                      </a></>
                                    ) : (
                                      <><p>Please come back in a few minutes to confirm private auction status.</p><a
                                      href="#"
                                      onClick={() => swal("Please come back in a few minutes to confirm private auction status.")}
                                      className="btn btn-primary text-white d-block"
                                      disabled="disabled"
                                    >
                                      Verify Auction
                                    </a></>
                                    )}
                                  </div>
                                )}
                              </li>
                              {shouldShowVerifyInExplorerButton && (
                                <li className="flex-grow-1">
                                  <div className="dropdown">
                                    <a href={`https://testnet.cspr.live/deploy/${deployHash}`} target="_blank" className="btn bg-dark-dim d-block">
                                      View on Explorer
                                    </a>
                                  </div>
                                </li>
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div> */}

                  </div>
                </div>
                
                
                
              </div>
            </div>
            <div className="col-lg-5 ms-auto">
              <div className="item-detail-content">
                <div className="item-detail-img-container item-detail-img-full">
                {renderMediaImage()}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
      <div
        className="modal "
        id="bidPurseModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Create Bid Purse</h4>
              <button
                type="button"
                className="btn-close icon-btn"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <em className="ni ni-cross"></em>
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleBidPurse}>
              <p className="mb-3">
                  You are about to place a bid for
                  <strong> {nft.mediaName}</strong> 
                  {/* <strong>{nft.artistName}</strong> */}
                </p>
                <div className="mb-3">
                  <label className="form-label">
                    Enter Amount 
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-s1"
                    // value={fundAmount}
                    onChange={handleFundAmountChange}
                  />
                  <small className="text-danger">{currentBid}</small>
                </div>
                {/* ... */}
                {canPlaceBid ?(
                  <button type="submit" className="btn btn-dark d-block">Bid </button>
                ):(
                  <button type="submit" className="btn btn-dark d-block" disabled>Bid </button>
                )}
                
              </form>
            </div>
          </div>
        </div>
      </div>
      <div
        className="modal fade"
        id="placeBidModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Place a Bid</h4>
              <button
                type="button"
                className="btn-close icon-btn"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <em className="ni ni-cross"></em>
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={placeBid}>
                <p className="mb-3">
                  You are about to place a bid for
                  <strong> {nft.mediaName}</strong> 
                  {/* <strong>{nft.artistName}</strong> */}
                </p>
                <div className="mb-3">
                  <label className="form-label">Your bid (CSPR)</label>
                  <input
                    type="text"
                    className="form-control form-control-s1"
                    placeholder="Minimum bid = 20"
                    value={bidAmount}
                    onChange={handleBidAmountChange}
                  />
                </div>
                <button type="submit" className="btn btn-dark d-block">
                  Place your Bid
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div
        className="modal fade"
        id="startAuctionModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Start Private Auction Contract</h4>
              <button
                type="button"
                className="btn-close icon-btn"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <em className="ni ni-cross"></em>
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleDeployAuctionContract}>
                <p className="mb-3">
                  You are about to deploy an Auction contract for
                  <strong> {nft.mediaName}</strong>
                  <strong> ({nft.assetSymbol})</strong>
                </p>
                <div className="mb-3">
                  <label className="form-label">Token Id</label>
                  <input
                    type="text"
                    className="form-control form-control-s1"
                    value={nft.tokenId}
                    disabled
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Auction Starts</label>
                  <input
                    type="datetime-local"
                    className="form-control form-control-s1"
                    onChange={handleStartTimeChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Auction Ends</label>
                  <input
                    type="datetime-local"
                    className="form-control form-control-s1"
                    onChange={handleEndTimeChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Enter Min Bid Price(CSPR)</label>
                  <input
                    type="text"
                    className="form-control form-control-s1"
                    value={minPrice}
                    onChange={handleMinPriceChange}
                  />
                </div>
                {/* ... */}
                <button type="submit" className="btn btn-dark d-block float-right">
                  Deploy Auction Contract
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      {nft.inAuction && bids.length > 0 && (
        <div className="row mb-4">
          <div className="col-10 mx-auto">
            <div className="item-detail-tab">
              <ul className="nav nav-tabs nav-tabs-s1" id="myTab" role="tablist">
                <li className="nav-item" role="presentation">
                  <button className="nav-link" id="bids-tab" data-bs-toggle="tab" data-bs-target="#bids" type="button" role="tab" aria-controls="bids" aria-selected="true">Bids</button>
                </li>
              </ul>
            </div>
            <div className="table-responsive">
              <table className="table mb-0 table-s1 fs-13 bg-gray">
                <thead>
                  <tr>
                    <th scope="col">Bidder</th>
                    <th scope="col">Bid Amount</th>
                    <th scope="col">Date</th>
                    <th scope="col">Verify</th>
                  </tr>
                </thead>
                <tbody>
                  {bids.map(bid => (
                    <tr key={bid.id}>
                      <td>{truncateKey(bid.bidder)} @{bid.user.username}</td>
                      <td>{bid.bid} CSPR</td>
                      <td>{formatDate(bid.createdAt)}</td>
                      <td>
                        {bid.user?.purse?.deployHash && (
                          <a
                            className="btn btn-info btn-sm"
                            href={`https://testnet.cspr.live/deploy/${bid.user.purse.deployHash}`}
                            target="_blank"
                          >
                            Verify
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
  }

