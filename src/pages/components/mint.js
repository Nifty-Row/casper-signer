import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import crypto from "crypto";
import CasperConnect from "./CasperConnect";
import axios from "axios";
import swal from "sweetalert";
import { Some, None } from "ts-results";
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

const Mint = () => {
  const [signerConnected, setSignerConnected] = useState(false);
  const [publicKey, setPublicKey] = React.useState(null);
  const [category, setCategory] = useState("");
  const [artworkFile, setArtworkFile] = useState(null);
  const [musicThumbnail, setMusicThumbnail] = useState(null);
  const [musicThumbnailUrl, setMusicThumbnailUrl] = useState("");
  const [artworkUrl, setArtworkUrl] = useState("");
  const [musicFileUrl, setMusicFileUrl] = useState("");
  const [movieThumbnailUrl, setMovieThumbnailUrl] = useState("");
  const [movieFileUrl, setMovieFileUrl] = useState("");
  const [musicSample, setMusicSample] = useState(null);
  const [movieThumbnail, setMovieThumbnail] = useState(null);
  const [movieSample, setMovieSample] = useState(null);
  const [nftName, setNftName] = useState("");
  const [nftDescription, setNftDescription] = useState("");
  const [socialMediaLink, setSocialMediaLink] = useState("");
  const [assetSymbol, setAssetSymbol] = useState("");
  const [assetType, setAssetType] = useState("Digital");
  const [artistName, setArtistName] = useState("");
  const [medium, setMedium] = useState("");
  const [year, setYear] = useState("");
  const [size, setSize] = useState("");
  const [tokenHash, setTokenHash] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [error, setError] = useState(null);

  const buttonClass = publicKey
    ? "btn btn-success-soft p-2 mb-0"
    : "btn btn-danger-soft p-2 mb-0";

  let buttonLabel = publicKey
    ? ` ${publicKey.slice(0, 6)}...${publicKey.slice(-6)}`
    : "Connect Wallet";

  // const tokenMetasCLValue = CLValue.fromMap(tokenMetas);
  ``;
  const testDeploy = async () => {
    swal("Notice", "Testinging Deployment", "Warning");
    const nftData = {
      tokenId: "1esdaiasasa21e3bcd",
      deployerKey: publicKey,
      ownerKey: publicKey,
      tokenHash: "",
      name: "His Dark Material Latest Version",
      description: "This is my amazing NFT",
      socialMediaLink: "https://twitter.com/myawesomeNFT",
      assetSymbol: "HDMLTV",
      assetType: "physical",
      mediaType: "image",
      artistName: "John Samuel",
      medium: "digital",
      year: "2022",
      size: "1920x1080",
      artworkUrl: "https://lisasuites.com/assets/images/gallery/15.jpg",
    };

    const contract = new Contracts.Contract();
    contract.setContractHash(
      "hash-976860ede039b6dfea08bb5565b5403b3df014b54dbce838c9ec40c065b04258"
    );

    const hash = CLPublicKey.fromHex(publicKey).toAccountHash();

    const accounthash = new CLAccountHash(hash);

    const recipient = new CLKey(accounthash);

    const a = new CLString(nftData.tokenId);

    const myList = new CLList([a]);
    const token_ids = new CLOption(Some(myList));

    const temp = new CLMap(
      Object.entries(nftData)
        .filter(([_, value]) => value !== '' && value !== undefined)
        .map(([key, value]) => [new CLString(key), new CLString(value)])
    );
    

    const token_metas = new CLList([temp]);
    const token_commissions = new CLList([temp]);

    const deploy = contract.callEntrypoint(
      "mint",
      RuntimeArgs.fromMap({
        recipient: recipient,
        token_ids: token_ids,
        token_metas: token_metas,
        token_commissions: token_commissions,
      }),
      CLPublicKey.fromHex(publicKey),
      "casper-test",
      "10000000000"
    );

    // Prepare the deploy
    const jsonDeploy = DeployUtil.deployToJson(deploy);
    try {
      // Sign the deploy
      const signedDeploy = await Signer.sign(jsonDeploy, publicKey);
      const backendData = {
        signedDeployJSON: signedDeploy,
      };

      // Send to the backend server for deployment
      const response = await axios.post(
        "https://shark-app-9kl9z.ondigitalocean.app/api/nft/deploySigned",
        backendData,
        { headers: { "Content-Type": "application/json" } }
      );
      const data = JSON.stringify(response);
      swal("Response", data, "success");
      console.log(response);
      // alert(response.data);
    } catch (error) {
      swal("Error!", error.message, "error");
      alert(error.message);
    }
  };

  const prepareAuctionDeploy = async (publicKeyHex) => {
    const publicKey = CLPublicKey.fromHex(publicKeyHex);
    //********** for token_contract_hash(CASK) start***********/
    const hexString1 =
      "6cde257852d7fcb0dd6b86dd3af612f5d3bf0f333ee16e69e2cde2954fb3bad2"; // nft token hash //cvcv_contract_package_hash

    /**
     * grant minter
     */
    const hex1 = Uint8Array.from(Buffer.from(hexString1, "hex"));

    const token_contract_hash = new CLKey(new CLByteArray(hex1));
    //********** for token_contract_hash(CASK) end***********/

    //********** recipient***********/
    //public key of
    const hexString2 =
      "01b8335627c462a074b389e4574dba3430fa30d86ee9cf615bc13471b746de03f3"; //jdk2 //public_key_of_account1

    const myHash2 = new CLAccountHash(
      CLPublicKey.fromHex(hexString2).toAccountHash()
    );

    const recipient = new CLKey(myHash2);
    //********** recipient***********/

    //********** token_ids***********/
    const mintedTokenId = "1esdaia21e34abcd"; //minted token ID
    const a = new CLString(mintedTokenId);
    const token_ids = new CLList([a]);
    // const token_ids = new CLOption(Some(myList));
    //********** token_ids***********/

    //*********beneficiary_account <Key>********/
    //public key of _____ signer wallet
    const hexString3 =
      "01b8335627c462a074b389e4574dba3430fa30d86ee9cf615bc13471b746de03f3"; //jdk2 //public_key_of_main_account

    const myHash3 = new CLAccountHash(
      CLPublicKey.fromHex(hexString3).toAccountHash()
    );

    const beneficiary_account = new CLKey(myHash3);
    //*********beneficiary_account <Key>********/

    //*********starting_price <Option<U512>>********/

    const starting_price = new CLOption(None, new CLU512Type()); //Start bid price set by nft owner.

    const reserve_price = new CLU512(10);

    const token_id = new CLString(mintedTokenId);

    const now = new Date();
    now.setHours(now.getHours() + 2);
    const start_time = new CLU64(now.getTime().toString());
    now.setDate(now.getDate() + 3);
    const cancellation_time = new CLU64(now.getTime().toString()); //unix timestamp

    const end_time = new CLU64(now.getTime().toString()); //unix timestamp

    const format = new CLString("ENGLISH");
    //********** for kyc_package_has start***********/
    const hexString4 =
      "a2d24badef6020572260d05a180663e631d1147390bd61d981df8ab2496fa91b";

    const hex4 = Uint8Array.from(Buffer.from(hexString4, "hex"));

    const kyc_package_hash = new CLKey(new CLByteArray(hex4));

    const name = new CLString("Auction");
    now.setDate(now.getDate() + 1);
    const bidder_count_cap = new CLOption(Some(new CLU64("5")));
    const auction_timer_extension = new CLOption(
      Some(new CLU64(now.getTime().toString()))
    );
    const minimum_bid_step = new CLOption(Some(new CLU512("5")));
    const hexString5 =
      "3d276dd4b06a751f9e4407a5639b72c4cbe98183c1f1a961ecf3b34686a44b46";

    const marketplace_account = new CLByteArray(
      Uint8Array.from(Buffer.from(hexString5, "hex"))
    );

    const marketplace_commission = new CLU32("200000");
    const has_enhanced_nft = new CLBool(false);
    const deployParams = new DeployUtil.DeployParams(
      publicKey,
      "casper-test",
      1,
      18000000
    );
    let args = [];

    args = RuntimeArgs.fromMap({
      // eslint-disable-next-line no-undef
      recipient: recipient,
      token_contract_hash: token_contract_hash, //
      token_ids: token_ids, //
      beneficiary_account: beneficiary_account,
      starting_price: starting_price, //
      reserve_price: reserve_price, //
      token_id: token_id, //
      start_time: start_time, //
      cancellation_time: cancellation_time, //
      end_time: end_time, //
      format: format, //
      kyc_package_hash: kyc_package_hash, //--
      name: name, //
      bidder_count_cap: bidder_count_cap, //
      auction_timer_extension: auction_timer_extension,
      minimum_bid_step: minimum_bid_step, //--
      marketplace_account: marketplace_account, //--
      marketplace_commission: marketplace_commission, //--
      has_enhanced_nft: has_enhanced_nft, //--
    });

    let lock_cspr_moduleBytes;
    await fetch("casper-private-auction-installer.wasm")
      .then((response) => response.arrayBuffer())
      .then((bytes) => (lock_cspr_moduleBytes = new Uint8Array(bytes)));

    const session = DeployUtil.ExecutableDeployItem.newModuleBytes(
      lock_cspr_moduleBytes,
      args
    );

    return DeployUtil.makeDeploy(
      deployParams,
      session,
      DeployUtil.standardPayment(300000000000)
    );
  };

  const testAuctionDeploy = async () => {
    swal("Notice", "Testing Auction Deployment", "Warning");

    let deploy, deployJSON;

    deploy = await prepareAuctionDeploy(publicKey);
    deployJSON = DeployUtil.deployToJson(deploy);
    let signedDeployJSON;

    try {
      signedDeployJSON = await Signer.sign(deployJSON, publicKey);
    } catch (err) {
      console.log(err);
      swal("Warning!", err.message, "error");
    }
    let auctionJSON = {
      signedDeployJSON: signedDeployJSON,
    };
    // Send to the backend server for deployment
    const response = await axios.post(
      "https://shark-app-9kl9z.ondigitalocean.app/api/auction/deployAuction",
      auctionJSON,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = JSON.stringify(response);
    swal("Response", data, "success");
    console.log(response);

    // setDeployhashnewModuleBytesDeploy(data);
    // // Prepare the deploy
    // const jsonDeploy = DeployUtil.deployToJson(deploy);
    // try {
    //   // Sign the deploy
    //   const signedDeploy = await Signer.sign(jsonDeploy, publicKey);
    //   const backendData = {
    //     signedDeployJSON: signedDeploy,
    //   };
    // } catch (error) {
    //   swal("Error!", error.message, "error");
    //   alert(error.message);
    // }
  };

  const checkConnection = async () => {
    try {
      return await Signer.isConnected();
    } catch (error) {
      if (
        error.message ===
        "Content script not found - make sure you have the Signer installed and refresh the page before trying again."
      ) {
        const installUrl = "https://www.casperwallet.io/";
        window.open(installUrl, "_blank");
        // You can also display a message to the user indicating that they need to install the wallet
      } else {
        console.error("Failed to connect to the signer:", error.message);
      }
    }
  };

  const getActiveKeyFromSigner = async () => {
    const key = await Signer.getActivePublicKey();
    console.log("Key : " + key);
    return key;
  };

  const connectToSigner = async () => {
    // console.log("Signer connected  :",);
    if (Signer.isConnected() == false) {
      alert("signer not connected");
    }
    try {
      let connectSigner = await Signer.sendConnectionRequest();
      console.log("connectSigner", connectSigner);
      swal("Notice", connectSigner, "success");
      getActiveKeyFromSigner();
    } catch (error) {
      console.error("Failed to connect to the signer:", error);
      console.log("Signer isconnected", Signer.isConnected());
    }
  };
  useEffect(() => {
    setTimeout(async () => {
      try {
        const connected = await checkConnection();
        setSignerConnected(connected);
        console.log("Is Connected", connected);
        if (connected == true) {
        }
      } catch (err) {
        console.log(err);
      }
    }, 100);

    const checkSignerConnection = async () => {
      try {
        if (signerConnected) setActiveKey(await getActiveKeyFromSigner());
        const signer = await Signer.isConnected();
        const publicKeyHex = await getActiveKeyFromSigner();
        // const publicKey = publicKeyHex.slice(0, 8); // take the first 8 characters
        setPublicKey(publicKeyHex);
      } catch (error) {
        setError(
          "There was an error connecting to the Casper Signer. Please make sure you have the Signer installed and refresh the page before trying again."
        );
      }
    };
    checkSignerConnection();
  }, []);

  const testBid = async () => {
    alert("testing bid");
  };

  return (
    <>
      <>
        <button
          className={buttonClass}
          href="#"
          role="button"
          aria-expanded="false"
          onClick={connectToSigner}
        >
          {/* <i className="bi bi-wallet"></i> */}
          {buttonLabel}
        </button>
        <button onClick={testDeploy}>Test Deploy</button>
        <button onClick={testAuctionDeploy}>Start Auction</button>
        <button onClick={testBid}>Test Bid</button>
      </>
    </>
  );
};

export default Mint;
