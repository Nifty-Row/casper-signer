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

  const placeBidLink = `nftDetails/${tokenId}`;
  return (
    <div className="col-xl-4 col-lg-4 col-sm-6">
      <div className="card card-full card-s3">
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
                {fullName}
              </a>
            </div>
          </div>
        </div>
        <div className="card-image">
          {mediaType === "artwork" && (
            <img src={artworkUrl} className="card-img" alt="art image" />
          )}
          {mediaType === "movie" && (
            <img
              src={movieThumbnailUrl}
              className="card-img"
              alt="Movie Thumbnail"
            />
          )}
          {mediaType === "music" && (
            <img
              src={musicThumbnailUrl}
              className="card-img"
              alt="Music Thumbnail"
            />
          )}
        </div>
        <div className="card-body px-0 pb-0">
          <h5 className="card-title text-truncate">
            <a href="product-details-v1.html">{mediaName}</a>
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
