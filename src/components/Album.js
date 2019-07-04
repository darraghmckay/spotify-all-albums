import React from "react";

const Album = ({ album, createdAt }) => (
  <div className="album">
    <a href={album.external_urls.spotify} target="_blank">
      <img src={album.images[0].url} />
    </a>
    <a href={album.external_urls.spotify} target="_blank">
      {album.name}
    </a>
    <div className="artists">
      {album.artists.map((artist, index) => (
        <React.Fragment key={artist.uri}>
          <a
            className="artist"
            href={artist.external_urls.spotify}
            target="_blank"
          >
            {artist.name}
          </a>
          {index < album.artists.length - 1 && (
            <span className="artist-divider">,</span>
          )}
        </React.Fragment>
      ))}
    </div>
  </div>
);

export default Album;
