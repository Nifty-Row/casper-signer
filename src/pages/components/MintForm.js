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
  CLOption,
  CLKey,
  CLAccountHash,
} from "casper-js-sdk";

import { getWalletBalance,totesToCSPR } from "@/utils/generalUtils";
import { WalletService } from "@/utils/WalletServices";

const MintForm = ({keyprop,balance}) => {
  let newKey = keyprop;
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

  const [walletBalance, setWalletBalance]= useState(balance);

  useEffect(() =>{
    const checkBalance = async () =>{
      if(!newKey) return;
      const balance = await getWalletBalance(newKey);      
      setWalletBalance(totesToCSPR(walletBalance || 0));  
    }
    if(walletBalance !== "unchecked") return;
    checkBalance();
  },[newKey,walletBalance]);

  
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
    const fetchUser = async ()=>{
       let userD = await getUserDataByKey(newKey);
       setUser(userD);
    }
    
    fetchUser();
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
  
  async function grantMinter(userKey) {
    if(canMint) return ;
    if(!userKey){
       swal("Notice","Please ensure your wallet is properly connected :"+userKey,"warning");
    return;
    }

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
  
      const response = await axios.post(url, { publicKey:userKey });
  
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
        console.error("Error:", response.data.response);
        swal("Error", JSON.stringify(response.data), "error");
      }
    } catch (error) {
      console.error("Error:", error);
      swal("Error", JSON.stringify(error.response.data), "error");
    }
  }
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    // Display the confirmation dialog and perform an action based on the response
    if(parseInt(walletBalance) < 50){
      swal("Warning",`Wallet Balance of ${walletBalance}CSPR is too low for this mint, please fund your wallet and try again`,"warning");
      return false;
    }
    console.log("balance",walletBalance);
    //return;
    swal({
      title: "Are you sure you want to submit?",
      text: "This action cannot be undone.",
      icon:"warning",
      dangerMode: true,
      buttons: {
        cancel: "No",
        confirm: "Yes",
      },
    }).then((response) => {
      if (!response) {
        swal("Notice","Submission Cancelled","info")
        return;
      } 
      else{
        if (!category || !assetType) {
          swal("Notice", "Please select asset category and type.", "warning");
          return;
        }
        if (!publicKey) {
          console.log(key);
          swal("Notice", "Public Key is empty. key :" + key, "warning");
          return;
        }
        if (!nftName) {
          swal("Notice", "Please Enter a name/title", "warning");
          return;
        }
        if (!assetSymbol) {
          swal("Notice", "Please Enter an asset symbol", "warning");
          return;
        }
        if (assetSymbol.length <3) {
          swal("Notice", "Asset Symbol must be at least 3 characters", "warning");
          return;
        }
        if (!nftDescription) {
          swal("Notice", "Please Enter asset description", "warning");
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
          // Object.assign(files, { artFile: artworkFile });
          formData.append("artFile", artworkFile);
        }
        if (musicThumbnail) {
          formData.append("musicThumbnail", musicThumbnail);
        }
        if (musicSample) {
          formData.append("musicFile", musicSample);
        }
        if (movieThumbnail) {
          formData.append("movieThumbnail", movieThumbnail);
        }
        if (movieSample) {
          formData.append("movieFile", movieSample);
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
        
        generateMediaUrls(formData).then(async (data)=>{
          if(!data) return;
          console.log(data);
          let artworkUrls = {};
          let musicUrls = {};
          let movieUrls = {};

          if (category === 'Artwork') {
            artworkUrls = data.artworkUrl || '';
          } else if (category === 'Music') {
            musicUrls = {
              fileUrl: data.fileUrl || '',
              thumbnailUrl: data.thumbnailUrl || '',
            };
          } else if (category === 'Movie') {
            movieUrls = {
              fileUrl: data.fileUrl || '',
              thumbnailUrl: data.thumbnailUrl || '',
            };
          }

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
            artworkUrl: artworkUrls,
            musicThumbnailUrl: musicUrls.thumbnailUrl,
            musicFileUrl: musicUrls.fileUrl,
            movieThumbnailUrl: movieUrls.thumbnailUrl,
            movieFileUrl: movieUrls.fileUrl,
          };
         
          let deploy = await prepareDeploy(nftData);
          console.log(deploy);
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
              let deployHash =data;
              setTokenHash(data);
              saveNFT(nftData).then(data =>{
                if(data){
                  window.location.href = `/nftDetails/${nftData.tokenId}`;
                  // swal({
                  //   title: 'Minting in progress',
                  //   text: `NFT Asset ${nftData.assetSymbol} has been deployed and Saved successfully. Please check your wallet for the status of the NFT in 3 minutes. What would you like to do next?`,
                  //   icon: 'success',
                  //   dangerMode: true,
                  //   buttons: {
                  //     mint: {
                  //       text: "Mint",
                  //       value: "mint",
                  //     },
                  //     check: {
                  //       text: "View on Casper",
                  //       className:"text-warning",
                  //       value: "confirm",
                  //     },
                  //     view: {
                  //       text: "View NFTs!",
                  //       value: "catch",
                  //     }
                      
                  //   },
                   
                  // }).then((result) => {
                  //   switch (result) {
             
                  //     case "confirm":
                  //       // swal("View Deployment on the Blockchain Network");
                  //       window.open(`https://testnet.cspr.live/deploy/${deployHash}`, '_blank');
                  //       break;
                   
                  //     case "catch":
                  //       // swal("Gotcha!", "View Your NFTs!", "success");
                  //       window.open(`/profile`,);
                  //       break;
            
                  //     case "mint":
                  //       resetForm();
                  //       swal("Gotcha!", "Mint New NFTs!", "success");
                  //       break;
    
                  //   }
                    
                  // });
                }
              });
            })
            .catch(error => {
              swal("Deployment Error", error.message, "error");
              console.error(error);
            });
        });
        
      }
    });
    
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
      console.log("Error: " + err);
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
        swal({
          title: "Success",
          text: "Upload Successful",
          icon: data.artworkUrl,
        });
        data.category = category;
        return data;
      } else if (category === "Music") {
        setArtworkUrl(null);
        setMovieThumbnailUrl("");
        setMovieFileUrl("");
        setMusicThumbnailUrl(data.thumbnailUrl);
        setMusicFileUrl(data.fileUrl);
        swal({
          title: "Success",
          text: "Upload Successful",
          icon: data.thumbnailUrl,
        });
        data.category = category;
        return data;
      } else if (category === "Movie") {
        setArtworkFile(null);
        setMusicThumbnailUrl("");
        setMusicFileUrl("");
        setMovieThumbnailUrl(data.thumbnailUrl);
        setMovieFileUrl(data.fileUrl);
        swal({
          title: "Success",
          text: "Upload Successful",
          icon: data.thumbnailUrl,
        });
        data.category = category;
        return data;
      }
      return false;
    } catch (err) {
      let msg = (err.response.data)? err.response.data : "Upload was not successful."
      swal("Error",JSON.stringify(err.message)+" : "+msg,"error");
      console.log(err);
      return false;
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
    
    if (category === "Movie" && assetType === "Digital") {
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
    } else if (category === "Movie" && assetType === "Physical") {
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
    const account_hashh = new CLString(
      "account-hash-268e98a4faf44865080eaba8bc88b07f8ae870575d100eb611d64c4f518d7f85"
    );
    const token_commission = new CLMap([
      [new CLString("nifty_account"), account_hashh],
      [new CLString("nifty_rate"), new CLString("2")],
    ]);

    const token_metas = new CLList([tempOptions]);
    const token_commissions = new CLList([token_commission]);
    const gas = "10000000000";
    let userWalBal = await userWalletBalance(publicKey);
    if(userWalBal <= parseInt(gas)){
      swal("Warning",'Your wallet Balance of '+totesToCSPR(parseInt(walletBalance))+"CSPR will not be enough for this transaction. Please fund your wallet")
      return;
    }
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
    return deploy;
    

  }

  async function userWalletBalance(publicKey){
    const balance = await getWalletBalance(publicKey);

    if (balance !== false) {
      console.log("Wallet balance:", balance);
      return balance;
    } else {
      console.log("Failed to fetch wallet balance.");
    }
  }

  const resetForm = () => {
    const form = formRef.current;
    if (form) {
      form.reset();
    }
  };

  return (
    <>
      <div className="row"></div>
      <section>
        <div className="container mt-4">
          <div className="row mt-4">
            {canMint ?(
              <>
              <div className="col-lg-12 mx-auto">
                <form ref={formRef} className="vstack gap-4" onSubmit={handleSubmit}>
                  <div className="card ">
                    <div className="card-header">
                      <h3 className="mb-4"><center>NFT Details</center></h3>
                    </div>
                  </div>
                  <div className="card-body shadow mb-4">
                    <div className="row g-3 mb-4 p-12">
                      <div className="col-md-6">
                        <label className="form-label text-dark text-bold">
                          Asset Category *
                        </label>
                        <div className="d-sm-flex">
                          <div className="form-check radio-bg-light me-4">
                            <input
                              className="form-check-input"
                              name="category"
                              value="Artwork"
                              type="radio"
                              id="category1"
                              checked={category === "Artwork"}
                              onChange={(e) => setCategory(e.target.value)}
                            />
                            <label className="form-check-label" htmlFor="category1">
                              Artwork
                            </label>
                          </div>
                          <div className="form-check radio-bg-light me-4">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="category"
                              value="Music"
                              id="category2"
                              checked={category === "Music"}
                              onChange={(e) => setCategory(e.target.value)}
                            />
                            <label className="form-check-label" htmlFor="category2">
                              Music
                            </label>
                          </div>
                          <div className="form-check radio-bg-light me-4">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="category"
                              value="Movie"
                              id="category3"
                              checked={category === "Movie & Animation"}
                              onChange={(e) => setCategory(e.target.value)}
                            />
                            <label className="form-check-label" htmlFor="category3">
                              Movies & Animations
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-dark text-bold">
                          Asset Type *
                        </label>
                        <div className="d-sm-flex">
                          <div className="form-check radio-bg-light me-4">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="assetType"
                              id="assetType1"
                              value="Digital"
                              checked={assetType === "Digital"}
                              onChange={(e) => setAssetType(e.target.value)}
                            />
                            <label className="form-check-label" htmlFor="assetType1">
                              Digital Asset
                            </label>
                          </div>
                          <div className="form-check radio-bg-light me-4">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="assetType"
                              id="assetType2"
                              value="Physical"
                              checked={assetType === "Physical"}
                              onChange={(e) => setAssetType(e.target.value)}
                            />
                            <label className="form-check-label" htmlFor="assetType2">
                              Physical Asset
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="card ">
                          {/* <div className="card-header border-bottom">
                                              <h5 className="mb-0">Upload Files</h5>
                                          </div> */}
                          <div className="card-body">
                            <div className="row g-3">
                              {category === "Artwork" && (
                                <div className="col-12">
                                  <label className="form-label">
                                    Image upload for artwork:
                                  </label>
                                  <input
                                    className="form-control"
                                    type="file"
                                    id="artwork-image"
                                    onChange={(e) =>
                                      setArtworkFile(e.target.files[0])
                                    }
                                    accept="image/gif, image/jpeg, image/png"
                                  />
                                  {/* <p className="small mb-0 mt-2"><b>Note:</b> Only JPG, JPEG, and PNG. Our suggested dimensions are 600px * 450px. The larger image will be cropped to 4:3 to fit our thumbnails/previews.</p> */}
                                </div>
                              )}
                              {category === "Music" && (
                                <>
                                  <div className="col-12">
                                    <label className="form-label">
                                      Audio Thumbnail Image:
                                    </label>
                                    <input
                                      className="form-control"
                                      type="file"
                                      id="thumbnail-image"
                                      onChange={(e) =>
                                        setMusicThumbnail(e.target.files[0])
                                      }
                                      accept="image/gif, image/jpeg, image/png"
                                    />
                                    {/* <p className="small mb-0 mt-2"><b>Note:</b> Only JPG, JPEG, and PNG. Our suggested dimensions are 600px * 450px. The larger image will be cropped to 4:3 to fit our thumbnails/previews.</p> */}
                                  </div>
                                  <div className="col-12">
                                    <label className="form-label">
                                      Sample audio file:
                                    </label>
                                    <input
                                      className="form-control"
                                      type="file"
                                      id="sample-audio"
                                      onChange={(e) =>
                                        setMusicSample(e.target.files[0])
                                      }
                                      accept="audio/wav, audio/mp3"
                                    />
                                    <p className="small mb-0 mt-2">
                                      <b>Note:</b> Only .MP3, .WAV, and .MP4
                                      accepted.{" "}
                                    </p>
                                  </div>
                                </>
                              )}
                              {category === "Movie & Animation" && (
                                <>
                                  <div className="col-12">
                                    <label className="form-label">
                                      Video Thumbnail Image:
                                    </label>
                                    <input
                                      className="form-control"
                                      type="file"
                                      id="movie-thumbnail-image"
                                      onChange={(e) =>
                                        setMovieThumbnail(e.target.files[0])
                                      }
                                      accept="image/gif, image/jpeg, image/png"
                                    />
                                    {/* <p className="small mb-0 mt-2"><b>Note:</b> Only JPG, JPEG, and PNG. Our suggested dimensions are 600px * 450px. The larger image will be cropped to 4:3 to fit our thumbnails/previews.</p> */}
                                  </div>
                                  <div className="col-12">
                                    <label className="form-label">
                                      Sample Video file:
                                    </label>
                                    <input
                                      className="form-control"
                                      type="file"
                                      name="my-image"
                                      id="artwork-image"
                                      onChange={(e) =>
                                        setMovieSample(e.target.files[0])
                                      }
                                      accept="video/mp4, video/mov, video/webm"
                                    />
                                    <p className="small mb-0 mt-2">
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
                      <div className="col-md-6">
                        <div className="card ">
                          <div className="card-body">
                            <div className="row g-3">
                              {assetType === "Digital" && (
                                <div className="col-12"></div>
                              )}
                              {assetType === "Physical" && (
                                <>
                                  <div className="col-6">
                                    <label className="form-label">Artist Name:</label>
                                    <input
                                      className="form-control"
                                      type="text"
                                      id="thumbnail-image"
                                      onChange={(e) =>
                                        setArtistName(e.target.value)
                                      }
                                      accept="image/gif, image/jpeg, image/png"
                                    />
                                    {/* <p className="small mb-0 mt-2"><b>Note:</b> Only JPG, JPEG, and PNG. Our suggested dimensions are 600px * 450px. The larger image will be cropped to 4:3 to fit our thumbnails/previews.</p> */}
                                  </div>
                                  <div className="col-6">
                                    <label className="form-label">Medium:</label>
                                    <input
                                      className="form-control"
                                      type="text"
                                      value={medium}
                                      onChange={(e) => setMedium(e.target.value)}
                                    />
                                  </div>
                                  <div className="col-6">
                                    <label className="form-label">
                                      Production Year:
                                    </label>
                                    <input
                                      className="form-control"
                                      type="text"
                                      value={year}
                                      onChange={(e) => setYear(e.target.value)}
                                    />
                                  </div>
                                  <div className="col-6">
                                    <label className="form-label">Asset Size:</label>
                                    <input
                                      className="form-control"
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

                      <div className="col-md-6">
                        <label className="form-label text-dark text-bold">
                          Asset Name/Title
                        </label>
                        <input
                          className="form-control"
                          type="text"
                          placeholder="Enter Asset name"
                          value={nftName}
                          onChange={(e) => setNftName(e.target.value)}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-dark text-bold">
                          Asset Symbol
                        </label>
                        <input
                          className="form-control"
                          type="text"
                          placeholder="Enter Asset Symbol E.g NGH"
                          value={assetSymbol}
                          onChange={(e) => setAssetSymbol(e.target.value)}
                        />
                      </div>
                      <div className="col-md-12">
                        <label className="form-label text-dark text-bold">
                          Asset Description
                        </label>
                        <textarea
                          className="form-control"
                          rows="6"
                          placeholder="Enter Asset Description"
                          value={nftDescription}
                          onChange={(e) => setNftDescription(e.target.value)}
                        ></textarea>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-dark text-bold">
                          Asset Social Link
                        </label>
                        <input
                          className="form-control"
                          type="text"
                          placeholder="Enter Social Link"
                          value={socialMediaLink}
                          onChange={(e) => setSocialMediaLink(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="text-end mb-4">
                    <button className="btn btn-success mb-4 text-white" >Proceed</button>
                  </div>
                </form>
              </div>
              <div className="col-lg-4">
              </div>
               </>
            ) : (
              <>
              <div className="col-md-12" >
                <h4 className="text-danger text-center">You do not have access to mint an NFT</h4>
                <center><button onClick={() => grantMinter(newKey)}  className="btn btn-primary btn-lg float-center mt-4 mb-4">Request Mint Access</button></center>
              </div></>
            )}
          </div>
        </div>
      </section>
      <div className=""></div>
    </>
  );
};

export default MintForm;
