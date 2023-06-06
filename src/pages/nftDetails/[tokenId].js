/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/rules-of-hooks */
import Head from "next/head";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Some, None } from "ts-results";
import moment from "moment";

import {
  checkConnection,
  getActiveKeyFromSigner,
  connectCasperSigner,
} from "@/utils/CasperUtils";
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

export default function NFTDetails() {
  const router = useRouter();
  const { query } = router;
  const [tokenId, setTokenId] = useState(null);
  const [nft, setNFT] = useState(null);
  const [key, setKey] = useState(null);
  const [isOwner, setIsOwner] = useState(null);
  const [bidAmount, setBidAmount] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [minPrice, setMinPrice] = useState(10);
  const [fundAmount, setFundAmount] = useState("1");

  useEffect(() => {
    getActiveKeyFromSigner().then((data) => {
      setKey(data);
    });
  }, []);

  useEffect(() => {
    if (query && query.tokenId) {
      setTokenId(query.tokenId);
    }
  }, [query]);

  useEffect(() => {
    if (tokenId) {
      fetch(`https://shark-app-9kl9z.ondigitalocean.app/api/nft/${tokenId}`)
        .then((response) => response.json())
        .then((data) => {
          setNFT(data);
          console.log("NBD",data);
        })
        .catch((error) => console.error(error));
    }
  }, [tokenId]);

  useEffect(() => {
    if (nft) {
      if (nft.ownerKey === key) {
        setIsOwner(true);
      }
    }
  }, [key, nft]);

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

  const prepareBidPurseDeploy = async () => {
    const Key = CLPublicKey.fromHex(key);
    const deployParams = new DeployUtil.DeployParams(
      Key,
      "casper-test",
      1,
      20000000
    );

    let args = [];
    const amount = new CLU512(3000000000);
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
    await fetch("bid-purse.wasm")
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

  const handlePlaceBid = (e) => {
    e.preventDefault();
    // Here you can use the bidAmount and fundAmount values to proceed with placing the bid
    console.log("Bid Amount:", bidAmount);
    console.log("Fund Amount:", fundAmount);

    // Call the prepareBidPurseDeploy function with the appropriate values
    prepareBidPurseDeploy(); // Pass the publicKeyHex as an argument

    // ... Rest of the code for placing the bid
  };

  const handleStartAuction = async (e) => {
    e.preventDefault();
    // swal({
    //   title: "Submitting...",
    //   text: "Please wait while we start your Auction.",
    //   icon: "info",
    //   buttons: false,
    //   closeOnClickOutside: false,
    //   closeOnEsc: false,
    // });

    let deploy, deployJSON;

    deploy = await prepareAuctionDeploy(key);
    deployJSON = DeployUtil.deployToJson(deploy);
    let signedDeployJSON;

    try {
      signedDeployJSON = await Signer.sign(deployJSON, key);
    } catch (err) {
      console.log(err);
      swal("Warning!", err.message, "error");
    }

    // Send to the backend server for deployment
    let auctionJSON = {
      signedDeployJSON: signedDeployJSON,
    };
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
  };

  if (!nft) {
    return <div>Loading...</div>;
  }

  const prepareAuctionDeploy = async () => {
    const Key = CLPublicKey.fromHex(key);
    //********** for token_contract_hash(CASK) start***********/
    const hexString1 =
      "6cde257852d7fcb0dd6b86dd3af612f5d3bf0f333ee16e69e2cde2954fb3bad2"; // nft token hash //cvcv_contract_package_hash

    const hex1 = Uint8Array.from(Buffer.from(hexString1, "hex"));

    const token_contract_hash = new CLKey(new CLByteArray(hex1));
    //********** for token_contract_hash(CASK) end***********/

    //********** recipient***********/
    //public key of
    const hexString2 = nft.ownerKey; //jdk2 //public_key_of_account1

    const myHash2 = new CLAccountHash(
      CLPublicKey.fromHex(hexString2).toAccountHash()
    );

    //********** token_ids***********/
    const a = new CLString(tokenId);
    const token_ids = new CLList([a]);
    // const token_ids = new CLOption(Some(myList));
    //********** token_ids***********/

    //*********beneficiary_account <Key>********/
    //public key of _____ signer wallet
    const hexString3 = key; //jdk2 //public_key_of_main_account

    const myHash3 = new CLAccountHash(
      CLPublicKey.fromHex(hexString3).toAccountHash()
    );

    const beneficiary_account = new CLKey(myHash3);
    //*********beneficiary_account <Key>********/

    const currentTimestamp = Date.now(); // Get the current timestamp in milliseconds

    // Set the durations in milliseconds
    const startDuration = moment(startTime).valueOf();
    const cancellationDuration = 12 * 60 * 60 * 1000;
    const endDuration = moment(endTime).valueOf();

    // Calculate the target timestamps by adding the durations to the current timestamp
    const startTimestamp = startDuration.toString();
    const cancellationTimestamp = currentTimestamp + cancellationDuration;
    const endTimestamp = endDuration.toString();

    //*********starting_price <Option<U512>>********/

    const starting_price = new CLOption(None, new CLU512Type()); //Start bid price set by nft owner.

    const reserve_price = new CLU512(minPrice);

    const token_id = new CLString(tokenId);

    const start_time = new CLU64(startTimestamp); //unix timestamp

    const cancellation_time = new CLU64(cancellationTimestamp); //unix timestamp

    const end_time = new CLU64(endTimestamp); //unix timestamp

    const format = new CLString("ENGLISH");
    //********** for kyc_package_hash start***********/
    const hexString4 =
      "a2d24badef6020572260d05a180663e631d1147390bd61d981df8ab2496fa91b";

    const hex4 = Uint8Array.from(Buffer.from(hexString4, "hex"));

    const kyc_package_hash = new CLKey(new CLByteArray(hex4));

    const name = new CLString("Auction for " + nft.tokenId);

    const bidder_count_cap = new CLOption(Some(new CLU64("5")));
    const auction_timer_extension = new CLOption(
      Some(new CLU64("1680045495000"))
    );
    const minimum_bid_step = new CLOption(Some(new CLU512("5")));
    const hexString5 =
      "9f67de32a9b87dfa7c416c34828a27dddf7c38810dbd29d601c7fd7078e1a88a";

    const marketplace_account = new CLByteArray(
      Uint8Array.from(Buffer.from(hexString5, "hex"))
    );

    const marketplace_commission = new CLU32("200000");
    const has_enhanced_nft = new CLBool(false);
    const deployParams = new DeployUtil.DeployParams(
      key,
      "casper-test",
      1,
      1800000
    );
    let args = [];

    args = RuntimeArgs.fromMap({
      // eslint-disable-next-line no-undef
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
                    Asset Type :{" "}
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
                <p class="item-detail-text mb-4">{nft.description}</p>
                <div class="item-credits">
                  <div class="row g-4">
                    <div class="col-xl-6">
                      <div class="card-media card-media-s1">
                        <a
                          href="#"
                          class="card-media-img flex-shrink-0 d-block"
                        >
                          <img
                            src="https://cdn.onlinewebfonts.com/svg/img_405324.png"
                            alt="avatar"
                          />
                        </a>
                        <div class="card-media-body">
                          <a href="author.html" class="fw-semibold">
                            {/* @{nft.user.username} */}
                          </a>
                          <p class="fw-medium small">
                            {/* {nft.user.category} */}
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* <div class="col-xl-6">
                      <div class="card-media card-media-s1">
                        <a
                          href="author.html"
                          class="card-media-img flex-shrink-0 d-block"
                        >
                          <img
                            src="https://cdn.onlinewebfonts.com/svg/img_405324.png"
                            alt="avatar"
                          />
                        </a>
                        <div class="card-media-body">
                          <a href="author.html" class="fw-semibold">
                            @kamran_ahmed
                          </a>
                          <p class="fw-medium small">Collection</p>
                        </div>
                      </div>
                    </div> */}
                  </div>
                </div>
                <div class="item-detail-btns mt-4">
                  <ul class="btns-group d-flex">
                    <li class="flex-grow-1">
                      {nft.inAuction && (
                        <a
                          href="#"
                          data-bs-toggle="modal"
                          data-bs-target="#placeBidModal"
                          class="btn btn-dark d-block"
                        >
                          Place a Bid
                        </a>
                      )}
                      {!nft.inAuction && nft.ownerKey == key && (
                        <a
                          href="#"
                          data-bs-toggle="modal"
                          data-bs-target="#startAuctionModal"
                          class="btn btn-dark d-block"
                        >
                          Start Auction
                        </a>
                      )}
                    </li>
                    {/* <li class="flex-grow-1">
                      <div class="dropdown">
                        <a
                          href="#"
                          class="btn bg-dark-dim d-block"
                          data-bs-toggle="dropdown"
                        >
                          Share
                        </a>
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
                        </div>
                      </div>
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
                  <strong>{nft.mediaName}</strong> from{" "}
                  <strong>{nft.artistName}</strong>
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
              <h4 class="modal-title">Start Auction</h4>
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
              <form onSubmit={handleStartAuction}>
                <p class="mb-3">
                  You are about to start an Auction for
                  <strong> {nft.mediaName}</strong>
                  <strong> {nft.artistName}</strong>
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
                  Deploy Auction
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
