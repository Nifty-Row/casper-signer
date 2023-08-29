/* eslint-disable @next/next/no-img-element */
import React from "react";

const NFTCard = ({ nftData }) => {
  if (!nftData) {
    return null;
  }

  const {
    tokenId,
    artworkUrl,
    musicThumbnailUrl,
    movieThumbnailUrl,
    mediaName,
    mediaType,
    assetSymbol,
    artistName,
    user = {},
  } = nftData;

  const fullName = user ? user.fullName : '';
  const defaultImg = "../../default.gif";
  const placeBidLink = `../../../nftDetails/${tokenId}`;

  const renderMediaImage = () => {
    if (mediaType === "artwork") {
      return <img src={artworkUrl || defaultImg} className="card-img nftcard-img" alt="art image" />;
    }
    if (mediaType === "movie") {
      return <img src={movieThumbnailUrl || defaultImg} className="card-img nftcard-img" alt="Movie Thumbnail" />;
    }
    if (mediaType === "music") {
      return <img src={musicThumbnailUrl || defaultImg} className="card-img nftcard-img" alt="Music Thumbnail" />;
    }
    return null;
  };


  return (
    <div className="col-xl-3 col-lg-3 col-sm-6">
      <div className="card card-full card-s3 mt-4">
        <div className="card-author d-flex align-items-center justify-content-between pb-3">
          <div className="d-flex align-items-center">
            <a href="../../author/" className="avatar me-1">
              <img
                src="https://cdn.onlinewebfonts.com/svg/img_405324.png"
                alt="avatar"
              />
            </a>
            <div className="custom-tooltip-wrap card-author-by-wrap">
              <span className="card-author-by card-author-by-2">Owned by</span>
              <a href="#" className="custom-tooltip author-link">
                {fullName ?(fullName):('Anonymous ')}
              </a>
            </div>
          </div>
        </div>
        <div className="card-image">
          {renderMediaImage()}
        </div>
        <div className="card-body px-0 pb-0">
          <h5 className="card-title text-truncate">
            <a href={placeBidLink}>{mediaName}</a>
          </h5>
          <div className="card-price-wrap d-flex align-items-center justify-content-sm-between pb-3">
            <div className="me-5 me-sm-2">
              <span className="card-price-title">Asset Type</span>
              <span className="card-price-number">{mediaType}</span>
            </div>
            <div className="text-sm-end">
              <span className="card-price-title">Asset Symbol</span>
              <span className="card-price-number d-block">{assetSymbol}</span>
            </div>
          </div>
          <a href={placeBidLink} className="btn btn-sm btn-dark">
            Asset Details
          </a>
        </div>
      </div>
    </div>
  );
};

export default NFTCard;
