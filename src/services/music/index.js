const express = require("express");
const musicRouter = express.Router();
const axios = require("axios");
const endpoints = {
  forYou: "/playlist/2249258602?limit=30",
  edm: "/playlist/4503899902?limit=30",
  workout: "/playlist/1857061922?limit=30",
  chill: "/playlist/3338949242?limit=30",
  new: "/playlist/63141574?limit=30",
  podcast: "/chart",
  popularAlbums: "/playlist/3155776842?limit=40",
  trendingNow: "/playlist/1111142221?limit=40",
  popularPlaylists: "/chart",
  search: "/search?q=",
  album: "/album/",
  artist: "/artist/",
};
const fetchMusic = async (endpoint, next) => {
  try {
    const response = await axios.get(process.env.DEEZER_API + endpoint);

    let music = [];
    const tracks = response.data.tracks;
    const playlist = response.data.playlists;
    console.log(response);
    if (tracks && endpoint !== "/chart" && !endpoint.includes("album")) {
      await tracks.data.forEach((track) => {
        !music.some((uniqueTrack) => uniqueTrack.album.id === track.album.id) && music.push(track);
      });
      return music;
    } else if (playlist) {
      return playlist.data;
    } else {
      return response.data;
    }
  } catch (error) {
    next(error);
  }
};

musicRouter.get("/:endp", async (req, res, next) => {
  try {
    const endp = req.params.endp;
    const query = req.query.query;
    const endpoint = query ? endpoints[endp] + query : endpoints[endp];
    const music = await fetchMusic(endpoint, next);
    if (music) res.send(music);
    else {
      const error = new Error("No music Found");
      error.status = 404;
      next(error);
    }
  } catch (error) {
    next(error);
  }
});

module.exports = musicRouter;
