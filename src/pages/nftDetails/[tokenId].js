/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/rules-of-hooks */
import Head from "next/head";
import Image from "next/image";
import { useState, useEffect, useLayoutEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Some, None } from "ts-results";
import moment from "moment";

import {
  WalletService
} from "@/utils/WalletServices";
import { formatDate, decodeSpecialCharacters, handleRefresh} from "@/utils/generalUtils";
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
  
  const { query } = router;
  const [tokenId, setTokenId] = useState("");
  const [nft, setNFT] = useState("");
  const [key, setKey] = useState("");
  const [isOwner, setIsOwner] = useState("");
  const [owner, setOwner] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [minPrice, setMinPrice] = useState(10);
  const [fundAmount, setFundAmount] = useState("1");
  const [user, setUser] = useState("");
  const [deployHash, setDeployHash] = useState("");
  const [auctionData, setAuctionData] = useState("");
  const [bids, setBids] = useState("");
  const [countdown, setCountdown] = useState('');
  const [auctionStarted, setAuctionStarted] = useState(false);
  const [auctionStartDate,setAuctionStartDate] = useState('');
  
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
              setNFT(data);
              if(data.user) setOwner(data.user);
              if(data.auction) setAuctionData(data.auction);
              setIsOwner(data.ownerKey === key);
              if(data.auction.deployHash) setDeployHash(data.auction.deployHash);
              if(data.bids) setBids(data.auction.deployHash);
            }).catch((error) => console.error("Error:",error));
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
    if (auctionData.startDate) {
      const auctionStartDate = new Date(auctionData.startDate).getTime();
      const auctionEndDate = new Date(auctionData.endDate).getTime();
  
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const distance = auctionStartDate - now;
        const distancee = auctionEndDate - now;
        console.log(distancee);
        console.log(distance);
        if (distance <= 0) {
          clearInterval(interval);
          setCountdown('Auction has started');
          setAuctionStarted(true);
        }else if(distancee <= 0){

        } else {
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
  
          setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        }
      }, 1000);
  
      return () => {
        clearInterval(interval);
      };
    } else {
      setCountdown('This asset is not in auction');
      setAuctionStarted(false);
    }
  }, [auctionData]);
  
  //handle page inputs
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
    if(!deploy) return;
    // console.log("deploy",JSON.stringify(deploy));
    const deployJSON = DeployUtil.deployToJson(deploy);
    // console.log(deployJSON)
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
    const startTimestamp = moment(startTime).valueOf().toString();
    const endTimestamp = moment(endTime, 'YYYY-MM-DDTHH:mm').valueOf().toString();

    // Calculate the cancellation timestamp by adding a duration to the current timestamp
    const cancellationDuration = 15 * 60 * 1000; // 15 mins after start time
    const cancellationTimestamp = +startTimestamp + +cancellationDuration;

    console.log("Time Stamp",startTimestamp.toString());
    console.log("Cancellation Time",cancellationTimestamp,formatDate(cancellationTimestamp));
    console.log("End Time", endTimestamp);
    console.log("End Time", endTime);
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
    if (startTimestamp - currentTimestamp < 10 * 60 * 1000) {
      swal("Warning!","Start time "+formatDate(startTimestamp)+" should be at least 10 minutes from the current time."+formatDate(currentTimestamp), "warning")
      console.error("Start time "+formatDate(startTimestamp)+" should be at least 10 minutes from the current time."+formatDate(currentTimestamp));
      return false;
    }

    // Validate the end time
    if (endTimestamp - cancellationTimestamp < 60 * 60 * 1000) {
      // End time is less than an hour from the cancellation time
      swal("Warning!","End time "+formatDate(endTimestamp)+" should be at least 1 hour from."+formatDate(cancellationTimestamp), "warning")
      console.error("End time "+formatDate(endTimestamp)+" should be at least 1 hour from "+formatDate(cancellationTimestamp));
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

  //verify and update auction details if the auction contract deploymnent was a succcess
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
      
      if(data.Success){
        swal("Success","Private Auction Contract was deployed successfully","success");
        getHashes(deployHash).then(async (data) => {
          console.log("Hashes",data);
          if(data.hashes){
            updateAuctionHashes(data.hashes).then((data)=> {
              setAuctionData(data);
            })
          }
        });
      }else if(data.Failure){
        swal("Verification Failed","Auction Deploy Failed => "+data.Failure.error_message,"error");
        deleteAuction(auctionData.id).then(data =>{
          setAuctionData("");
          let newNFT = nft;
          newNFT.inAuction=false;
          setNFT(newNFT);
          swal("Auction",data+"You can now redeploy another private auction","info");
        })
      }
      return data;
    } catch (error) {
      console.error(error);
      return null;
    }
    
  }

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
        return updatePurseUref(user.purse.id, purse.uref).then(data =>{
          swal("Success","Your Bid Purse has been verified and updated Successfully","success");
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
  const endAuction = async(e) => {
    e.preventDefault();
    
    handleFinalize().then(async (data) => {

    });

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
  async function addBid(){
    let backendData = {
      bidder:key,
      userId:user.id,
      bid:bidAmount,
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
    console.log("bid purse deploy Hash",response.data); // Process the response data
    swal("Success","Bid has been saved Successfully","success");
    handleRefresh();
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
    handleRefresh();
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
                            {countdown !== "Auction has started" && countdown !== "This asset is not in auction" ?(
                              <div> 
                                {!auctionData.contractHash ?(
                                  <h4 class="text-danger">Auction not Verified</h4>
                                ):(
                                  <><p>Auction Starts in </p><h4>{countdown}</h4></>
                                )}
                            </div>
                            ):(
                              <div> 
                              <h4>{countdown}</h4>
                            </div>
                            )}
                            
                        <div class="item-detail-btns mt-4">
                            <ul class="btns-group d-flex">
                              <li class="flex-grow-1">
                                {countdown === "Auction has started" && nft.inAuction && !isOwner && user.purse !== null && (
                                  <>
                                  {!user.purse.uref &&(<a
                                    href="#"
                                    onClick={confirmBidPurse}

                                    class="btn btn-warning d-block mb-4"
                                  >
                                      Confirm Bid Purse
                                    </a>)}
                                    <a
                                    href="#"
                                    data-bs-toggle="modal"
                                    data-bs-target="#placeBidModal"
                                    class="btn btn-dark d-block mb-0"
                                  >
                                    Place a Bid
                                  </a></>
                                )}
                                {countdown === "Auction has started" && nft.inAuction && !isOwner && user.purse === null && (
                                  <a
                                    href="#"
                                    data-bs-toggle="modal"
                                    data-bs-target="#bidPurseModal"
                                    class="btn btn-dark d-block "
                                  >
                                    Create Bid Purse
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
                                {nft.inAuction && isOwner  && auctionData.contractHash && auctionData.status === "pending" && (
                                  <a
                                    href="#"
                                  onClick={startAuction}
                                    class="btn btn-success text-white d-block"
                                  >
                                    Open Auction
                                  </a>
                                )}
                                {nft.inAuction && isOwner  && auctionData.contractHash && auctionData.status === "open" && (
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
                              {deployHash && (
                              <li class="flex-grow-1">
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
        id="bidPurseModal"
        tabindex="-1"
        aria-hidden="true"
      >
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h4 class="modal-title">Create Bid Purse</h4>
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
              <form onSubmit={handleBidPurse}>
                
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
                 Create Purse </button>
              </form>
            </div>
          </div>
        </div>
      </div>
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
              <form onSubmit={placeBid}>
                <p class="mb-3">
                  You are about to place a bid for
                  <strong> {nft.mediaName}</strong> 
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
                <button type="submit" class="btn btn-dark d-block">
                  Place your Bid
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
      {bids && (<div class="row mb-4">
        
        <div class="col-10 mx-auto">
          <div class="item-detail-tab">
            <ul class="nav nav-tabs nav-tabs-s1" id="myTab" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="bids-tab" data-bs-toggle="tab" data-bs-target="#bids" type="button" role="tab" aria-controls="bids" aria-selected="true">Bids</button>
                </li>
            </ul>
          </div>
          <div class="table-responsive">
              <table class="table mb-0 table-s1 fs-13 bg-gray">
                  <thead>
                      <tr>
                          <th scope="col">Bidder</th>
                          <th scope="col">Bid</th>
                          <th scope="col">Date</th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr>
                          {/* <th scope="row" class="fw-regular">Created</th> */}
                          <td>Monica Lucas</td>
                          <td>1</td>
                          <td>1 day ago</td>
                      </tr>
                      <tr>
                          {/* <th scope="row" class="fw-regular">Created</th> */}
                          <td>-</td>
                          <td>2 days ago</td>
                      </tr>
                      <tr>
                          {/* <th scope="row" class="fw-regular">Sale</th> */}
                          <td>Diamond Cube</td>
                          <td>1</td>
                          <td>3 days ago</td>
                      </tr>
                      
                  </tbody>
              </table>
          </div>
        </div>
      </div>)}
      <Footer />
    </>
  );
}
