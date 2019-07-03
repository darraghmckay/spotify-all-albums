import React, { Component } from "react";
import SpotifyWebApi from "spotify-web-api-node";
import Album from "../components/Album";

const ACCESS_TOKEN_COOKIE = "spotify:access_token";
const URL = `${document.location.origin}/${
  document.location.href.includes("github") ? "spotify-all-albums/" : ""
}`;

const credentials = {
  clientId: "ddc2dee973c44bbf8c584dcd0c50e3b7",
  redirectUri: URL
};

const scopes = [
  "streaming",
  "user-read-birthdate",
  "user-read-email",
  "user-read-private",
  "user-library-read"
];
let player;
let token;
let playerId;

const getCookie = name => {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  if (match) return match[2];
};

const spotifyApi = new SpotifyWebApi(credentials);

const authorizeUrl = spotifyApi
  .createAuthorizeURL(scopes)
  .replace("code", "token");
const cookieToken = getCookie(ACCESS_TOKEN_COOKIE);

class Albums extends Component {
  state = {
    albums: []
  };

  componentDidMount() {
    if (cookieToken || document.location.href.includes("access_token")) {
      token =
        cookieToken ||
        document.location.href.match("access_token=([a-zA-Z0-9-_]+)")[1];
      spotifyApi.setAccessToken(token);

      if (document.location.href !== URL) {
        document.location.replace(URL);
      }

      if (!cookieToken) {
        document.cookie = `${ACCESS_TOKEN_COOKIE}=${token}; max-age=3600`;
      }

      const albums = {};
      const limit = 50;
      const getAlbumsFromTracks = (offset = 0) =>
        spotifyApi
          .getMySavedTracks({ limit: limit, offset: offset })
          .then(data => {
            data.body.items.forEach(item => {
              if (albums[item.track.album.id]) {
                const addedAt = new Date(
                  Math.max(
                    new Date(item.added_at),
                    albums[item.track.album.id].addedAt
                  )
                );
                albums[item.track.album.id] = {
                  addedAt: addedAt,
                  album: item.track.album
                };
              } else {
                albums[item.track.album.id] = {
                  addedAt: new Date(item.added_at),
                  album: item.track.album
                };
              }
            });

            if (data.body.next) {
              return getAlbumsFromTracks(offset + limit);
            } else {
              console.log(
                "Albums albums track",
                Object.keys(albums).length,
                albums
              );
              return;
            }
          });

      const getAlbums = (offset = 0) =>
        spotifyApi
          .getMySavedAlbums({ limit: limit, offset: offset })
          .then(data => {
            data.body.items.forEach(item => {
              if (albums[item.album.id]) {
                const addedAt = new Date(
                  Math.max(
                    new Date(item.added_at),
                    albums[item.album.id].addedAt
                  )
                );

                albums[item.album.id] = {
                  addedAt: addedAt,
                  album: item.album
                };
              } else {
                albums[item.album.id] = {
                  addedAt: new Date(item.added_at),
                  album: item.album
                };
              }
            });

            if (data.body.next) {
              return getAlbums(offset + limit);
            } else {
              console.log("Albums album", Object.keys(albums).length, albums);
              return;
            }
          });

      Promise.all([getAlbumsFromTracks(), getAlbums()]).then(() => {
        console.log("All albums gathered", Object.keys(albums).length, albums);
        const sortedAlbums = Object.keys(albums)
          .sort(
            (albumId1, albumId2) =>
              albums[albumId2].addedAt - albums[albumId1].addedAt
          )
          .map(albumId => albums[albumId]);
        console.log(sortedAlbums);
        this.setState({
          albums: sortedAlbums
        });
      });
    } else {
      document.location = authorizeUrl;
    }
  }
  render() {
    const { albums } = this.state;
    if (albums.length === 0) {
      return <h1>Loading...</h1>;
    }

    return (
      <div>
        <h1>Albums</h1>
        <div className="album-container">
          {albums.map(({ album, addedAt }) => (
            <Album album={album} addedAt={addedAt} key={album.id} />
          ))}
        </div>
      </div>
    );
  }
}

export default Albums;
