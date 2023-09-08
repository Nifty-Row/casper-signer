import { useEffect, useState, useRef } from "react";
import axios from "axios";
import swal from "sweetalert";
import crypto from "crypto";
import { Some, None } from "ts-results";

import {
  DeployUtil,
  Contracts,
  CLPublicKey,
  RuntimeArgs,
  CasperClient,
  decodeBase16,
  CLString,
  CLMap,
  CLList,
  CLURef,
  CLKey,
  CLAccountHash,
  CLByteArray,
  CLU512,
} from "casper-js-sdk";

import { encodeSpecialCharacters } from "@/utils/generalUtils";
import { WalletService } from "@/utils/WalletServices";

const TestForm = (key) => {
    const Buffer = require('buffer').Buffer;
    const [activeKey, setActiveKey] = useState(null);
    useEffect(() => {
      WalletService.isSiteConnected().then(async (data) => {
        let key = await WalletService.getActivePublicKey();
        if(!activeKey) setActiveKey(key);
        console.log("Active Key",activeKey);
      });
    }, [activeKey]);
  
    // useEffect(() => {
    //   try {
    //      let deploy = getDeploy("ec84ef900e5906d4e7e37fa318022baac4a5fc76b39e5379b4769b31d778dfa3"); 
    //     console.log(deploy)
    //   } catch (error) {
    //     console.log(error);
    //   }
     
    // }, []);
  
  
    async function prepareAuctionInitDeploy(publicKey){
      const contract = new Contracts.Contract();
      contract.setContractHash(
        "hash-3323eb2707533952c7ef758924622f95f8358ee88c4987f14ded307cef1f87cd"
      );
  
      const C_hash = "3323eb2707533952c7ef758924622f95f8358ee88c4987f14ded307cef1f87cd";
      const hexC_hash = Uint8Array.from(Buffer.from(C_hash, "hex"));
      const auction_contract_hash = new CLKey(new CLByteArray(hexC_hash));
      
      const P_hash = "cb091a509ae69b2667b5c902563bca3b47dfe468938d3e34156996eae33ae137";
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
  
    const handleStartAuction = async (e) => {
      e.preventDefault();
      swal({
        title: "Submitting...",
        text: "Please wait while we start your Auction.",
        icon: "info",
        buttons: false,
        closeOnClickOutside: true,
        closeOnEsc: false,
      });
      const deploy = await prepareAuctionInitDeploy(activeKey);
  
      const deployJSON = DeployUtil.deployToJson(deploy);
      try {
        const res = await WalletService.sign(JSON.stringify(deployJSON), activeKey);
        if (res.cancelled) {
          swal("Notice","Casper Wallet Signing cancelled","warning");
        } else {
          let signedDeploy = DeployUtil.setSignature(
            deploy,
            res.signature,
            CLPublicKey.fromHex(activeKey)
          );
          const signedDeployJSON = DeployUtil.deployToJson(signedDeploy);
          
          const backendData = {
            signedDeployJSON: signedDeployJSON,
          };
          
          console.log("before deploy",signedDeployJSON);
          // try{
          //   
          //   let returnedHash = await deploySigned(signedDeployJSON);
          //   swal("Deployed!", JSON.stringify(returnedHash), "info");
          //   console.log("after deploy",returnedHash);
          // }catch(e){
          //   console.error(e);
          //   swal("Error!", "Error here, check console", "error");
          // }
          // return;
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
              if(!axios) swal("Notice !","Axios is not present","warning");
              // Send to the backend server for deployment
              const response = await axios.post(
                "https://shark-app-9kl9z.ondigitalocean.app/api/nft/deploySigned",
                backendData,
                { headers: { "Content-Type": "application/json" } }
              );
              const data = JSON.stringify(response.data);
              swal("Success",data,"success");
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
    };

    async function getBid(){
        const contract = new Contracts.Contract();
        contract.setContractHash(
          "hash-3323eb2707533952c7ef758924622f95f8358ee88c4987f14ded307cef1f87cd"
        );
    
        const deploy = contract.callEntrypoint(
          "get_bid",
          RuntimeArgs.fromMap({
            
          }),
          CLPublicKey.fromHex(activeKey),
          "casper-test",
          "30000000000"
        );

        const deployJSON = DeployUtil.deployToJson(deploy);
        try {
          const res = await WalletService.sign(JSON.stringify(deployJSON), activeKey);
          if (res.cancelled) {
            swal("Notice","Casper Wallet Signing cancelled","warning");
          } else {
            let signedDeploy = DeployUtil.setSignature(
              deploy,
              res.signature,
              CLPublicKey.fromHex(activeKey)
            );
            const signedDeployJSON = DeployUtil.deployToJson(signedDeploy);
            
            const backendData = {
              signedDeployJSON: signedDeployJSON,
            };
            
            console.log("before deploy",signedDeployJSON);
            // try{
            //   
            //   let returnedHash = await deploySigned(signedDeployJSON);
            //   swal("Deployed!", JSON.stringify(returnedHash), "info");
            //   console.log("after deploy",returnedHash);
            // }catch(e){
            //   console.error(e);
            //   swal("Error!", "Error here, check console", "error");
            // }
            // return;
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
                if(!axios) swal("Notice !","Axios is not present","warning");
                // Send to the backend server for deployment
                const response = await axios.post(
                  "https://shark-app-9kl9z.ondigitalocean.app/api/nft/deploySigned",
                  backendData,
                  { headers: { "Content-Type": "application/json" } }
                );
                const data = JSON.stringify(response.data);
                swal("Success",data,"success");
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

    async function handleFinalize(){
        const contract = new Contracts.Contract();
        contract.setContractHash(
          "hash-3323eb2707533952c7ef758924622f95f8358ee88c4987f14ded307cef1f87cd"
        );
    
        const deploy = contract.callEntrypoint(
          "finalize",
          RuntimeArgs.fromMap({
            
          }),
          CLPublicKey.fromHex(activeKey),
          "casper-test",
          "30000000000"
        );

        const deployJSON = DeployUtil.deployToJson(deploy);
        try {
          const res = await WalletService.sign(JSON.stringify(deployJSON), activeKey);
          if (res.cancelled) {
            swal("Notice","Casper Wallet Signing cancelled","warning");
          } else {
            let signedDeploy = DeployUtil.setSignature(
              deploy,
              res.signature,
              CLPublicKey.fromHex(activeKey)
            );
            const signedDeployJSON = DeployUtil.deployToJson(signedDeploy);
            
            const backendData = {
              signedDeployJSON: signedDeployJSON,
            };
            
            console.log("before deploy",signedDeployJSON);
            // try{
            //   
            //   let returnedHash = await deploySigned(signedDeployJSON);
            //   swal("Deployed!", JSON.stringify(returnedHash), "info");
            //   console.log("after deploy",returnedHash);
            // }catch(e){
            //   console.error(e);
            //   swal("Error!", "Error here, check console", "error");
            // }
            // return;
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
                if(!axios) swal("Notice !","Axios is not present","warning");
                // Send to the backend server for deployment
                const response = await axios.post(
                  "https://shark-app-9kl9z.ondigitalocean.app/api/nft/deploySigned",
                  backendData,
                  { headers: { "Content-Type": "application/json" } }
                );
                const data = JSON.stringify(response.data);
                swal("Success",data,"success");
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

    async function prepareBid(publicKey){
        const contract = new Contracts.Contract();
        contract.setContractHash(
          "hash-3323eb2707533952c7ef758924622f95f8358ee88c4987f14ded307cef1f87cd"
        );
    
        
        const bid = new CLU512(20);
        
        const uRef = "uref-8c9faa2d829dd84a9c2cc2ec5bb777e46cf2f26860627319d66bf862e21b22d0-007";
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

    const handleBid = async (e) => {
        e.preventDefault();
        swal({
          title: "Submitting...",
          text: "Please wait while we place bid.",
          icon: "info",
          buttons: false,
          closeOnClickOutside: true,
          closeOnEsc: false,
        });
        const deploy = await prepareBid(activeKey);
    
        const deployJSON = DeployUtil.deployToJson(deploy);
        try {
          const res = await WalletService.sign(JSON.stringify(deployJSON), activeKey);
          if (res.cancelled) {
            swal("Notice","Casper Wallet Signing cancelled","warning");
          } else {
            let signedDeploy = DeployUtil.setSignature(
              deploy,
              res.signature,
              CLPublicKey.fromHex(activeKey)
            );
            const signedDeployJSON = DeployUtil.deployToJson(signedDeploy);
            
            const backendData = {
              signedDeployJSON: signedDeployJSON,
            };
            
            console.log("before deploy",signedDeployJSON);
            // try{
            //   
            //   let returnedHash = await deploySigned(signedDeployJSON);
            //   swal("Deployed!", JSON.stringify(returnedHash), "info");
            //   console.log("after deploy",returnedHash);
            // }catch(e){
            //   console.error(e);
            //   swal("Error!", "Error here, check console", "error");
            // }
            // return;
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
                if(!axios) swal("Notice !","Axios is not present","warning");
                // Send to the backend server for deployment
                const response = await axios.post(
                  "https://shark-app-9kl9z.ondigitalocean.app/api/nft/deploySigned",
                  backendData,
                  { headers: { "Content-Type": "application/json" } }
                );
                const data = JSON.stringify(response.data);
                swal("Success",data,"success");
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
    };
  

  return (
    <>
    <li>
        <a href="#" className="btn btn-lg btn-success text-white" onClick={handleStartAuction}>
            Start Auction
        </a>
    </li>
    {/* <li>
        <a href="#" className="btn btn-lg btn-info" onClick={getBid}>
            Get Bids
        </a>
    </li> */}
    <li>
        <a href="#" className="btn btn-lg btn-danger" onClick={handleFinalize}>
            Finalize
        </a>
    </li>
    {/* <li>
        <a href="#" className="btn btn-lg btn-warning" onClick={handleStartAuction}>
            Cancel Auction
        </a>
    </li> */}
    {/* <li>
        <a href="#" className="btn btn-lg btn-success" onClick={handleBid}>
           Bid
        </a>
    </li>
    <li>
        <a href="#" className="btn btn-lg btn-secondary" onClick={handleStartAuction}>
            Cancel Bid
        </a>
    </li> */}
    </>
  );
};

export default TestForm;
