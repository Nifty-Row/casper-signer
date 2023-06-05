/* eslint-disable @next/next/no-img-element */
import React from "react";

const NFTCard = ({ nftData }) => {
  const {
    tokenId,
    artworkUrl,
    musicThumbnailUrl,
    movieThumbnailUrl,
    mediaName,
    mediaType,
    assetSymbol,
    artistName,
  } = nftData;

  console.log("nftData",nftData);
  const placeBidLink = `nftDetails/${tokenId}`;
  return (
    <div class="col-xl-3 col-lg-4 col-sm-6">
      <div class="card card-full card-s3">
        <div class="card-author d-flex align-items-center justify-content-between pb-3">
          <div class="d-flex align-items-center">
            <a href="author.html" class="avatar me-1">
              <img
                src="https://cdn.onlinewebfonts.com/svg/img_405324.png"
                alt="avatar"
              />
            </a>
            <div class="custom-tooltip-wrap card-author-by-wrap">
              <span class="card-author-by card-author-by-2">Owned by</span>
              <a href="author.html" class="custom-tooltip author-link">
                {artistName}
              </a>
            </div>
          </div>
        </div>
        <div class="card-image">
          {mediaType === "artwork" && (
            <img src={artworkUrl} class="card-img" alt="art image" />
          )}
          {mediaType === "movie" && (
            <img
              src={movieThumbnailUrl}
              class="card-img"
              alt="Movie Thumbnail"
            />
          )}
          {mediaType === "music" && (
            <img
              src={musicThumbnailUrl}
              class="card-img"
              alt="Music Thumbnail"
            />
          )}
        </div>
        <div class="card-body px-0 pb-0">
          <h5 class="card-title text-truncate">
            <a href="product-details-v1.html">{mediaName}</a>
          </h5>
          <div class="card-price-wrap d-flex align-items-center justify-content-sm-between pb-3">
            <div class="me-5 me-sm-2">
              <span class="card-price-title">Asset Type</span>
              <span class="card-price-number">{mediaType}</span>
            </div>
            <div class="text-sm-end">
              <span class="card-price-title">Asset Symbol</span>
              <span class="card-price-number d-block">{assetSymbol}</span>
            </div>
          </div>
          <a href={placeBidLink} class="btn btn-sm btn-dark">
            Asset Details
          </a>
        </div>
      </div>
    </div>
  );
};

export default NFTCard;
