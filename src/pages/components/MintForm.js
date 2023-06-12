import { useEffect, useState } from "react";
import axios from "axios";
import swal from "sweetalert";
import crypto from "crypto";
import { Some, None } from "ts-results";

import {
  Signer,
  DeployUtil,
  Contracts,
  CLPublicKey,
  RuntimeArgs,
  CasperClient,
  decodeBase16,
  CLString,
  CLMap,
  CLList,
  CLOption,
  CLKey,
  CLAccountHash,
} from "casper-js-sdk";

import { checkConnection, getActiveKeyFromSigner } from "@/utils/CasperUtils";
import { deploySigned, toHex } from "@/utils/generalUtils";
import { WalletService } from "@/utils/WalletServices";

const MintForm = (key) => {
  let newKey = key.publicKeyProp;
  const [publicKey, setPublicKey] = useState(null);

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
  const [canMint, setCanMint] = useState(false);

  useEffect(() => {
    const token = () => {
      const currentDate = new Date().toISOString();
      const hash = crypto.createHash("sha256");
      hash.update(currentDate);
      let newToken = hash.digest("hex");
      setTokenHash(newToken);
    };

    const generateTokenId = () => {
      const currentDate = new Date().toISOString();
      const hash = crypto.createHash("sha256");
      hash.update(currentDate);
      const hex = hash.digest("hex");
      setTokenId(hex.substring(0, 12));
      setPublicKey(newKey);
    };

    token();
    generateTokenId();
  }, [newKey]);

  useEffect(() => {
    const grantMinterAsync = async () => {
      if (newKey && !canMint) {
        try {
          let result = await getUserDataByKey(newKey);
          // Handle the result if needed
        } catch (error) {
          console.error("Error:", error);
        }
      }
    };
  
    grantMinterAsync();
  }, [newKey, canMint]);
  
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!category || !assetType) {
      swal("Notice", "Please select asset category and type.", "warning");
      return;
    }
    if (!publicKey) {
      console.log(key);
      swal("Notice", "Public Key is empty. key :" + key, "warning");
      return;
    }

    if (category === "Artwork" && !artworkFile) {
      swal("Notice", "Please upload an artwork image.", "warning");
      return;
    } else if (category === "Music" && (!musicThumbnail || !musicSample)) {
      swal(
        "Notice",
        "Please upload both the audio thumbnail and sample file.",
        "warning"
      );
      return;
    } else if (
      category === "Movie & Animation" &&
      (!movieThumbnail || !movieSample)
    ) {
      swal(
        "Notice",
        "Please upload both the video thumbnail and file.",
        "warning"
      );
      return;
    }

    const formData = new FormData();
    const files = {};
    if (artworkFile) {
      Object.assign(files, { artFile: artworkFile });
      formData.append("artFile", artworkFile);
    }
    if (musicThumbnail) {
      Object.assign(files, { musicThumbnail: musicThumbnail });
    }
    if (musicSample) {
      Object.assign(files, { musicFile: musicSample });
    }
    if (movieThumbnail) {
      Object.assign(files, { movieThumbnail: movieThumbnail });
    }
    if (movieSample) {
      Object.assign(files, { movieFile: movieSample });
    }

    formData.append("mediaType", category.toLowerCase());
    formData.append("files", files);
    swal({
      title: "Submitting...",
      text: "Please wait while we process your request.",
      icon: "info",
      buttons: false,
      closeOnClickOutside: false,
      closeOnEsc: false,
    });
    console.log(files);
    
    generateMediaUrls(formData)
    .then(async (data)=>{
      const nftData = {
        tokenId: tokenId,
        deployerKey: publicKey,
        ownerKey: publicKey,
        tokenHash: "",
        name: nftName,
        description: nftDescription,
        socialMediaLink: socialMediaLink,
        assetSymbol: assetSymbol,
        assetType: assetType,
        mediaType: category,
        artistName: artistName,
        medium: medium,
        year: year,
        size: size,
        artworkUrl: artworkUrl,
        musicThumbnailUrl: musicThumbnailUrl,
        musicFileUrl: musicFileUrl,
        movieThumbnailUrl: movieThumbnailUrl,
        movieFileUrl: movieFileUrl,
      };

      let deploy = await prepareDeploy(nftData);

      deployNFT(deploy)
        .then(data => {
          swal("Deployment ", data, "success");
          console.log(data);
          saveNFT(nftData);
        })
        .catch(error => {
          swal("Deployment Error", error.message, "error");
          console.error(error);
        });
    });
    
    
    // alert("redirect  here");
  };

  async function grantMinter(publicKey) {
    swal({
      title: "Submitting...",
      text: "Please wait while we grant you access to mint NFTs.",
      icon: "info",
      buttons: false,
      closeOnClickOutside: false,
      closeOnEsc: false,
    });
    try {
      const url = "https://shark-app-9kl9z.ondigitalocean.app/api/nft/grantMinter"; // Replace with your API endpoint

      const response = await axios.post(url, { publicKey });

      if (response.status === 200) {
        const deployHash = response.data;
        console.log("Deploy hash:", deployHash);
        setCanMint(true);
        swal(
          "Success",
          "Access has been granted, you can now mint.",
          "success"
        );
        // Handle successful response
      } else {
        // Handle error response
        console.error("Error:", response.data);
        swal("Error", response.data, "error");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  async function getUserDataByKey(publicKey) {
    try {
      const url = `https://shark-app-9kl9z.ondigitalocean.app/api/user/userByKey/${publicKey}`; // Replace with your API endpoint

      const response = await axios.get(url, { publicKey });

      if (response.status === 200) { 
        const canMint = response.data.canMint;
        if (canMint) {
          setCanMint(true);
        } else {
          grantMinter(publicKey);
        }

        // Handle successful response
      } else {
        // Handle error response
        console.error("Error:", response.data);
        swal("Error", response.data, "error");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  async function saveNFT(nftData){
    swal({
      title: "Saving NFT",
      text: "Please wait while we process your request.",
      icon: "info",
      buttons: false,
      closeOnClickOutside: false,
      closeOnEsc: false,
    });
    try {
      const createResponse = await fetch(
        "https://shark-app-9kl9z.ondigitalocean.app/api/nft/addNft",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(nftData),
        }
      );
      swal(JSON.stringify(createResponse));
      if (createResponse.nft) {
        swal(
          "Mint Successful!",
          `NFT ${createResponse.nft.assetSymbol} Saved successfully.`,
          "success"
        );
      } else {
        alert("Failed to create NFT.");
      }
    } catch (error) {
      console.log(error);
      swal("Error!", "An error occurred while creating NFT.", "Error");
    }

  }
  async function deployNFT(deploy){

    // Prepare the deploy
    const jsonDeploy = DeployUtil.deployToJson(deploy);
    // let result = WalletService.sign(JSON.stringify(jsonDeploy), publicKey);
    console.log("JSON DEPLOY ",deploy);
    // return;

    // Sign the deploy
    WalletService.sign(JSON.stringify(jsonDeploy), publicKey)
    .then(async res => {
      if (res.cancelled) {
        swal("Warning",'Sign cancelled',"info");
      } else {
        // console.log(publicKey, " SignedDeployJSON ",toHex(res.signature) );
        // return;
        const signedDeploy = DeployUtil.setSignature(
          deploy,
          toHex(res.signature),
          CLPublicKey.fromHex(publicKey)
        );
        console.log("signedDeploy", signedDeploy);
        let aarggs = signedDeploy.session.storedContractByHash.args
        alert(typeof(Object.entries(aarggs)[0]));
        console.log("Arguments",Object.entries(Object.entries(aarggs)[0]));
        swal("Submited",JSON.stringify(Object.entries(aarggs)[0][0]),"success");
        // return
        // Convert the hash object to a hes string
        signedDeploy.hash = toHex(signedDeploy.hash);
        signedDeploy.session.storedContractByHash.args = toHex(signedDeploy.session.storedContractByHash.args);
        signedDeploy.header.bodyHash = toHex(signedDeploy.header.bodyHash);
        signedDeploy.session.storedContractByHash.hash = toHex(signedDeploy.session.storedContractByHash.hash);
        signedDeploy.header.account = publicKey;
        console.log(JSON.stringify(signedDeploy));
        // return;
        const backendData = {
          signedDeployJSON: {
            deploy : signedDeploy,
          }
        };
        
        // let ress = await deploySigned(backendData.signedDeployJSON);
        // if(ress) swal("Submited","","success");
        // console.log("BackendData ",ress);
        // return;
        try {
          if(signedDeploy){
            // Send to the backend server for deployment
            const response = await axios.post(
              "https://shark-app-9kl9z.ondigitalocean.app/api/nft/deploySigned",
              backendData,
              { headers: { "Content-Type": "application/json" } }
            );
            const data = JSON.stringify(response);
            console.log("Sever Response",response);
            return response;
          }
        }catch (error) {
          swal("Error!", error.message, "error");
          return false;
        }
      }
    });

  }

  async function generateMediaUrls(formData){
    try {
      const { data } = await axios.post(
        "https://shark-app-9kl9z.ondigitalocean.app/api/nft/generateMediaUrls",
        formData
      );

      if (category === "Artwork") {
        setMovieThumbnailUrl("");
        setMovieFileUrl("");
        setMusicThumbnailUrl("");
        setMusicFileUrl("");
        setMusicSample(null);
        setMovieThumbnail(null);
        setMovieSample(null);
        setMusicThumbnail(null);
        setArtworkUrl(data.artworkUrl);
        // swal({
        //   title: "Success",
        //   text: "Upload Successful",
        //   icon: data.artworkUrl,
        // });
        return true;
      } else if (category === "Music") {
        setArtworkUrl(null);
        setMovieThumbnailUrl("");
        setMovieFileUrl("");
        setMusicThumbnailUrl(data.thumbnailUrl);
        setMusicFileUrl(data.fileUrl);
        // swal({
        //   title: "Success",
        //   text: "Upload Successful",
        //   icon: data.thumbnailUrl,
        // });
        return true;
      } else if (category === "Movie") {
        setArtworkFile(null);
        setMusicThumbnailUrl("");
        setMusicFileUrl("");
        setMovieThumbnailUrl(data.thumbnailUrl);
        setMovieFileUrl(data.fileUrl);
        // swal({
        //   title: "Success",
        //   text: "Upload Successful",
        //   icon: data.thumbnailUrl,
        // });
        return true;
      }
      return false;
    } catch (err) {
      swal("Error",JSON.stringify(err.message),"error");
      console.log(err);
    }
  }

  async function prepareDeploy(nftData){
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
    let tempOptions;
    // Artwork Category
    if (category === "Artwork" && assetType === "Digital") {
      tempOptions = new CLMap([
        [new CLString("name"), new CLString(nftData.name)],
        [new CLString("description"), new CLString(nftData.description)],
        [new CLString("socialMediaLink"), new CLString(nftData.socialMediaLink)],
        [new CLString("assetSymbol"), new CLString(nftData.assetSymbol)],
        [new CLString("assetType"), new CLString(nftData.assetType)],
        [new CLString("mediaType"), new CLString(nftData.mediaType)],
        [new CLString("artworkUrl"), new CLString(nftData.artworkUrl)],
      ]);
    }else if (category === "Artwork" && assetType === "Physical") {
      tempOptions = new CLMap([
        [new CLString("name"), new CLString(nftData.name)],
        [new CLString("description"), new CLString(nftData.description)],
        [new CLString("socialMediaLink"), new CLString(nftData.socialMediaLink)],
        [new CLString("assetSymbol"), new CLString(nftData.assetSymbol)],
        [new CLString("assetType"), new CLString(nftData.assetType)],
        [new CLString("mediaType"), new CLString(nftData.mediaType)],
        [new CLString("artworkUrl"), new CLString(nftData.artworkUrl)],
        [new CLString("artistName"), new CLString(nftData.artistName)],
        [new CLString("medium"), new CLString(nftData.medium)],
        [new CLString("year"), new CLString(nftData.year)],
        [new CLString("size"), new CLString(nftData.size)],
      ]);
    }

    if (category === "Music" && assetType === "Digital") {
      tempOptions = new CLMap([
        [new CLString("name"), new CLString(nftData.name)],
        [new CLString("description"), new CLString(nftData.description)],
        [new CLString("socialMediaLink"), new CLString(nftData.socialMediaLink)],
        [new CLString("assetSymbol"), new CLString(nftData.assetSymbol)],
        [new CLString("assetType"), new CLString(nftData.assetType)],
        [new CLString("mediaType"), new CLString(nftData.mediaType)],
        [new CLString("musicThumbnailUrl"), new CLString(nftData.musicThumbnailUrl)],
        [new CLString("musicFileUrl"), new CLString(nftData.musicFileUrl)],
      ]);
    } else if (category === "Music" && assetType === "Physical") {
      tempOptions = new CLMap([
        [new CLString("name"), new CLString(nftData.name)],
        [new CLString("description"), new CLString(nftData.description)],
        [new CLString("socialMediaLink"), new CLString(nftData.socialMediaLink)],
        [new CLString("assetSymbol"), new CLString(nftData.assetSymbol)],
        [new CLString("assetType"), new CLString(nftData.assetType)],
        [new CLString("mediaType"), new CLString(nftData.mediaType)],
        [new CLString("musicThumbnailUrl"), new CLString(nftData.musicThumbnailUrl)],
        [new CLString("musicFileUrl"), new CLString(nftData.musicFileUrl)],
        [new CLString("artistName"), new CLString(nftData.artistName)],
        [new CLString("medium"), new CLString(nftData.medium)],
        [new CLString("year"), new CLString(nftData.year)],
        [new CLString("size"), new CLString(nftData.size)],
      ]);
    }
    
    if (category === "Movie & Animation" && assetType === "Digital") {
      tempOptions = new CLMap([
        [new CLString("name"), new CLString(nftData.name)],
        [new CLString("description"), new CLString(nftData.description)],
        [new CLString("socialMediaLink"), new CLString(nftData.socialMediaLink)],
        [new CLString("assetSymbol"), new CLString(nftData.assetSymbol)],
        [new CLString("assetType"), new CLString(nftData.assetType)],
        [new CLString("mediaType"), new CLString(nftData.mediaType)],
        [new CLString("movieThumbnailUrl"), new CLString(nftData.movieThumbnailUrl)],
        [new CLString("movieFileUrl"), new CLString(nftData.movieFileUrl)],
      ]);
    } else if (category === "Movie & Animation" && assetType === "Physical") {
      tempOptions = new CLMap([
        [new CLString("name"), new CLString(nftData.name)],
        [new CLString("description"), new CLString(nftData.description)],
        [new CLString("socialMediaLink"), new CLString(nftData.socialMediaLink)],
        [new CLString("assetSymbol"), new CLString(nftData.assetSymbol)],
        [new CLString("assetType"), new CLString(nftData.assetType)],
        [new CLString("mediaType"), new CLString(nftData.mediaType)],
        [new CLString("movieThumbnailUrl"), new CLString(nftData.movieThumbnailUrl)],
        [new CLString("movieFileUrl"), new CLString(nftData.movieFileUrl)],
        [new CLString("artistName"), new CLString(nftData.artistName)],
        [new CLString("medium"), new CLString(nftData.medium)],
        [new CLString("year"), new CLString(nftData.year)],
        [new CLString("size"), new CLString(nftData.size)],
      ]);
    }

    const token_metas = new CLList([tempOptions]);
    const token_commissions = new CLList([tempOptions]);

    const deploy = contract.callEntrypoint(
      "mint",
      RuntimeArgs.fromMap({
        recipient: recipient,
        token_ids: token_ids,
        token_metas: tempOptions,
        // token_commissions: token_commissions,
      }),
      CLPublicKey.fromHex(publicKey),
      "casper-test",
      "30000000000",
    );

    return deploy;
    

  }

  return (
    <>
      <div class="row"></div>
      <section>
        <div class="container mt-4">
          <div class="row mt-4">
            <div class="col-lg-8">
              <form class="vstack gap-4" onSubmit={handleSubmit}>
                <div class="card shadow">
                  <div class="card-header border-bottom">
                    <h5 class="mb-4">NFT Details</h5>
                  </div>
                </div>
                <div class="card-body shadow mb-4">
                  <div class="row g-3 mb-4 p-12">
                    <div class="col-md-6">
                      <label class="form-label text-dark text-bold">
                        Asset Category *
                      </label>
                      <div class="d-sm-flex">
                        <div class="form-check radio-bg-light me-4">
                          <input
                            class="form-check-input"
                            name="category"
                            value="Artwork"
                            type="radio"
                            id="category1"
                            checked={category === "Artwork"}
                            onChange={(e) => setCategory(e.target.value)}
                          />
                          <label class="form-check-label" for="category1">
                            Artwork
                          </label>
                        </div>
                        <div class="form-check radio-bg-light me-4">
                          <input
                            class="form-check-input"
                            type="radio"
                            name="category"
                            value="Music"
                            id="category2"
                            checked={category === "Music"}
                            onChange={(e) => setCategory(e.target.value)}
                          />
                          <label class="form-check-label" for="category2">
                            Music
                          </label>
                        </div>
                        <div class="form-check radio-bg-light me-4">
                          <input
                            class="form-check-input"
                            type="radio"
                            name="category"
                            value="Movie & Animation"
                            id="category3"
                            checked={category === "Movie & Animation"}
                            onChange={(e) => setCategory(e.target.value)}
                          />
                          <label class="form-check-label" for="category3">
                            Movies & Animations
                          </label>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-dark text-bold">
                        Asset Type *
                      </label>
                      <div class="d-sm-flex">
                        <div class="form-check radio-bg-light me-4">
                          <input
                            class="form-check-input"
                            type="radio"
                            name="assetType"
                            id="assetType1"
                            value="Digital"
                            checked={assetType === "Digital"}
                            onChange={(e) => setAssetType(e.target.value)}
                          />
                          <label class="form-check-label" for="assetType1">
                            Digital Asset
                          </label>
                        </div>
                        <div class="form-check radio-bg-light me-4">
                          <input
                            class="form-check-input"
                            type="radio"
                            name="assetType"
                            id="assetType2"
                            value="Physical"
                            checked={assetType === "Physical"}
                            onChange={(e) => setAssetType(e.target.value)}
                          />
                          <label class="form-check-label" for="assetType2">
                            Physical Asset
                          </label>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="card ">
                        {/* <div class="card-header border-bottom">
                                            <h5 class="mb-0">Upload Files</h5>
                                        </div> */}
                        <div class="card-body">
                          <div class="row g-3">
                            {category === "Artwork" && (
                              <div class="col-12">
                                <label class="form-label">
                                  Image upload for artwork:
                                </label>
                                <input
                                  class="form-control"
                                  type="file"
                                  id="artwork-image"
                                  onChange={(e) =>
                                    setArtworkFile(e.target.files[0])
                                  }
                                  accept="image/gif, image/jpeg, image/png"
                                />
                                {/* <p class="small mb-0 mt-2"><b>Note:</b> Only JPG, JPEG, and PNG. Our suggested dimensions are 600px * 450px. The larger image will be cropped to 4:3 to fit our thumbnails/previews.</p> */}
                              </div>
                            )}
                            {category === "Music" && (
                              <>
                                <div class="col-12">
                                  <label class="form-label">
                                    Audio Thumbnail Image:
                                  </label>
                                  <input
                                    class="form-control"
                                    type="file"
                                    id="thumbnail-image"
                                    onChange={(e) =>
                                      setMusicThumbnail(e.target.files[0])
                                    }
                                    accept="image/gif, image/jpeg, image/png"
                                  />
                                  {/* <p class="small mb-0 mt-2"><b>Note:</b> Only JPG, JPEG, and PNG. Our suggested dimensions are 600px * 450px. The larger image will be cropped to 4:3 to fit our thumbnails/previews.</p> */}
                                </div>
                                <div class="col-12">
                                  <label class="form-label">
                                    Sample audio file:
                                  </label>
                                  <input
                                    class="form-control"
                                    type="file"
                                    id="sample-audio"
                                    onChange={(e) =>
                                      setMusicSample(e.target.files[0])
                                    }
                                    accept="audio/wav, audio/mp3"
                                  />
                                  <p class="small mb-0 mt-2">
                                    <b>Note:</b> Only .MP3, .WAV, and .MP4
                                    accepted.{" "}
                                  </p>
                                </div>
                              </>
                            )}
                            {category === "Movie & Animation" && (
                              <>
                                <div class="col-12">
                                  <label class="form-label">
                                    Video Thumbnail Image:
                                  </label>
                                  <input
                                    class="form-control"
                                    type="file"
                                    id="movie-thumbnail-image"
                                    onChange={(e) =>
                                      setMovieThumbnail(e.target.files[0])
                                    }
                                    accept="image/gif, image/jpeg, image/png"
                                  />
                                  {/* <p class="small mb-0 mt-2"><b>Note:</b> Only JPG, JPEG, and PNG. Our suggested dimensions are 600px * 450px. The larger image will be cropped to 4:3 to fit our thumbnails/previews.</p> */}
                                </div>
                                <div class="col-12">
                                  <label class="form-label">
                                    Sample Video file:
                                  </label>
                                  <input
                                    class="form-control"
                                    type="file"
                                    name="my-image"
                                    id="artwork-image"
                                    onChange={(e) =>
                                      setMovieSample(e.target.files[0])
                                    }
                                    accept="video/mp4, video/mov, video/webm"
                                  />
                                  <p class="small mb-0 mt-2">
                                    <b>Note:</b> Only .MP4, .MOV, and .WEBM
                                    accepted.{" "}
                                  </p>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="card ">
                        <div class="card-body">
                          <div class="row g-3">
                            {assetType === "Digital" && (
                              <div class="col-12"></div>
                            )}
                            {assetType === "Physical" && (
                              <>
                                <div class="col-6">
                                  <label class="form-label">Artist Name:</label>
                                  <input
                                    class="form-control"
                                    type="text"
                                    id="thumbnail-image"
                                    onChange={(e) =>
                                      setArtistName(e.target.files[0])
                                    }
                                    accept="image/gif, image/jpeg, image/png"
                                  />
                                  {/* <p class="small mb-0 mt-2"><b>Note:</b> Only JPG, JPEG, and PNG. Our suggested dimensions are 600px * 450px. The larger image will be cropped to 4:3 to fit our thumbnails/previews.</p> */}
                                </div>
                                <div class="col-6">
                                  <label class="form-label">Medium:</label>
                                  <input
                                    class="form-control"
                                    type="text"
                                    value={medium}
                                    onChange={(e) => setMedium(e.target.value)}
                                  />
                                </div>
                                <div class="col-6">
                                  <label class="form-label">
                                    Production Year:
                                  </label>
                                  <input
                                    class="form-control"
                                    type="text"
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                  />
                                </div>
                                <div class="col-6">
                                  <label class="form-label">Asset Size:</label>
                                  <input
                                    class="form-control"
                                    type="text"
                                    value={size}
                                    onChange={(e) => setSize(e.target.value)}
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="col-md-6">
                      <label class="form-label text-dark text-bold">
                        Asset Name/Title
                      </label>
                      <input
                        class="form-control"
                        type="text"
                        placeholder="Enter Asset name"
                        value={nftName}
                        onChange={(e) => setNftName(e.target.value)}
                      />
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-dark text-bold">
                        Asset Symbol
                      </label>
                      <input
                        class="form-control"
                        type="text"
                        placeholder="Enter Asset Symbol E.g NGH"
                        value={assetSymbol}
                        onChange={(e) => setAssetSymbol(e.target.value)}
                      />
                    </div>
                    <div class="col-md-12">
                      <label class="form-label text-dark text-bold">
                        Asset Description
                      </label>
                      <textarea
                        class="form-control"
                        rows="6"
                        placeholder="Enter Asset Description"
                        value={nftDescription}
                        onChange={(e) => setNftDescription(e.target.value)}
                      ></textarea>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-dark text-bold">
                        Asset Social Link
                      </label>
                      <input
                        class="form-control"
                        type="text"
                        placeholder="Enter Social Link"
                        value={socialMediaLink}
                        onChange={(e) => setSocialMediaLink(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div class="text-end mb-4">
                  <button class="btn btn-primary mb-4">Preview Asset</button>
                </div>
              </form>
            </div>
            <div class="col-lg-4">

            </div>
          </div>
        </div>
      </section>
      <div class=""></div>
    </>
  );
};

export default MintForm;
