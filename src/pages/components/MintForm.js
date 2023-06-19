import { useEffect, useState, useRef } from "react";
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

import { encodeSpecialCharacters } from "@/utils/generalUtils";
import { WalletService } from "@/utils/WalletServices";

const MintForm = (key) => {
  let newKey = key.publicKeyProp;
  const formRef = useRef(null);
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
  const [user, setUser] = useState(null);

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
          const userData = await getUserDataByKey(newKey);
          setUser(userData);
          if (userData.canMint) {
            setCanMint(true);
          } else {
            await grantMinter(newKey);
          }
        } catch (error) {
          console.error("Error:", error);
        }
      }
    };
  
    grantMinterAsync();
  }, [newKey, canMint]);
  
  async function getUserDataByKey(publicKey) {
    try {
      const url = `https://shark-app-9kl9z.ondigitalocean.app/api/user/userByKey/${publicKey}`;
  
      const response = await axios.get(url, { publicKey });
  
      if (response.status === 200) {
        return response.data;
      } else {
        console.error("Error:", response.data);
        swal("Error", response.data, "error");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }
  
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
      const url = "https://shark-app-9kl9z.ondigitalocean.app/api/nft/grantMinter";
  
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
      } else {
        console.error("Error:", response.data);
        swal("Error", response.data, "error");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }
  
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
    
    generateMediaUrls(formData)
    .then(async (data)=>{
      const nftData = {
        tokenId: tokenId,
        deployerKey: publicKey,
        ownerKey: publicKey,
        tokenHash: "",
        userId: user.id,
        mediaName: nftName,
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
      swal({
        title: "Sign the Transaction",
        text: "Please Sign the transaction with your Casper Wallet",
        icon: "info",
        buttons: false,
        closeOnClickOutside: false,
        closeOnEsc: false,
      });
      deployNFT(deploy)
        .then(data => {

          swal("Deployed Successfully", data, "success");
          console.log(data);
          nftData.tokenHash = data;
          setTokenHash(data);
          saveNFT(nftData).then(data =>{
            if(data){
              
              swal({
                title: 'Minting Complete',
                text: `NFT Asset ${nftData.assetSymbol} Minted and Saved successfully. What would you like to do next?`,
                icon: 'success',
                dangerMode: true,
                buttons: {
                  mint: {
                    text: "Mint",
                    value: "mint",
                  },
                  check: {
                    text: "View on Casper",
                    className:"text-warning",
                    value: "confirm",
                  },
                  view: {
                    text: "View NFTs!",
                    value: "catch",
                  }
                  
                },
               
              }).then((result) => {
                switch (result) {
         
                  case "confirm":
                    // swal("View Deployment on the Blockchain Network");
                    window.open(`https://testnet.cspr.live/deploy/${tokenHash}`, '_blank');
                    break;
               
                  case "catch":
                    // swal("Gotcha!", "View Your NFTs!", "success");
                    window.open(`/profile`,);
                    break;
        
                  case "mint":
                    resetForm();
                    swal("Gotcha!", "Mint New NFTs!", "success");
                    break;

                }
                
              });
            }
          });
        })
        .catch(error => {
          swal("Deployment Error", error.message, "error");
          console.error(error);
        });
    });
    
    
    // alert("redirect  here");
  };

  async function saveNFT(nftData){
    swal({
      title: "Saving NFT...",
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
      if (createResponse.ok) {
        return true;
        
      } else {
        swal("Notice!","Failed to Save NFT.","error");
        return false;
      }
    } catch (error) {
      console.log(error);
      swal("Error!", "An error occurred while creating NFT.", "error");
      return false;
    }

  }
  async function deployNFT(deploy){

    
    const jsonDeploy = DeployUtil.deployToJson(deploy);

    try {
      const res = await WalletService.sign(JSON.stringify(jsonDeploy), publicKey);
      if (res.cancelled) {
        swal("Notice","Casper Wallet Signing cancelled","warning");
      } else {
        let signedDeploy = DeployUtil.setSignature(
          deploy,
          res.signature,
          CLPublicKey.fromHex(publicKey)
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
              "https://shark-app-9kl9z.ondigitalocean.app/api/nft/deploySigned",
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
    } catch (err) {
      alert("Error: " + err);
    }


    

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
        [new CLString("name"), new CLString(nftData.mediaName)],
        [new CLString("description"), new CLString(nftData.description)],
        [new CLString("socialMediaLink"), new CLString(nftData.socialMediaLink)],
        [new CLString("assetSymbol"), new CLString(nftData.assetSymbol)],
        [new CLString("assetType"), new CLString(nftData.assetType)],
        [new CLString("mediaType"), new CLString(nftData.mediaType)],
        [new CLString("artworkUrl"), new CLString(nftData.artworkUrl)],
      ]);
    }else if (category === "Artwork" && assetType === "Physical") {
      tempOptions = new CLMap([
        [new CLString("name"), new CLString(nftData.mediaName)],
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
        [new CLString("name"), new CLString(nftData.mediaName)],
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
        [new CLString("name"), new CLString(nftData.mediaName)],
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
        [new CLString("name"), new CLString(nftData.mediaName)],
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
        [new CLString("name"), new CLString(nftData.mediaName)],
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
        token_metas: token_metas,
        token_commissions: token_commissions,
      }),
      CLPublicKey.fromHex(publicKey),
      "casper-test",
      "30000000000"
    );
    return deploy;
    

  }

  const resetForm = () => {
    const form = formRef.current;
    if (form) {
      form.reset();
    }
  };

  return (
    <>
      <div class="row"></div>
      <section>
        <div class="container mt-4">
          <div class="row mt-4">
            <div class="col-lg-8">
              <form ref={formRef} class="vstack gap-4" onSubmit={handleSubmit}>
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
                  <button class="btn btn-success mb-4 text-white" >Proceed</button>
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
