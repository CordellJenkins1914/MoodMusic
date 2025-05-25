import express from "express";
const router = express.Router();
import SpotifyWebApi from "spotify-web-api-node";
import buildTracks from '../utils/buildTracks.js'
import generateRandomString from "../utils/generateRandomString.js";
import querystring from "querystring";

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const FRONTEND_URI = process.env.FRONTEND_URI;

  const scopes = [
    `user-modify-playback-state
    user-read-playback-state
    user-read-currently-playing
    user-library-modify
    user-library-read
    user-top-read
    playlist-read-private
    playlist-modify-public
    playlist-modify-private
    streaming
    user-read-email
    user-read-private`
];

    const state = generateRandomString(16);

    var spotifyApi = new SpotifyWebApi({
        redirectUri: REDIRECT_URI,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET
    });

    let authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);
    console.log(authorizeURL);


    router.get('/login', (req, res) => {
      res.redirect(authorizeURL);
    });
  
    router.get('/callback', async (req, res) => {
    const code = req.query.code || null;
    const error = req.query.error || null;

    if (error) {
        console.error('Callback Error:', error);
        res.send(`Callback Error: ${error}`);
        return;
    }

    spotifyApi
    .authorizationCodeGrant(code)
    .then(data => {

      req.session.access_token = data.body['access_token'];
      req.session.refresh_token = data.body['refresh_token'];
      req.session.expires_in = data.body['expires_in'];



      spotifyApi.setAccessToken(req.session.access_token);
      spotifyApi.setRefreshToken(req.session.refresh_token);
      
      const queryParams = querystring.stringify({
        access_token: req.session.access_token,
        expires_in: req.session.expires_in,
      });

      res.redirect(`${FRONTEND_URI}/?${queryParams}`);
    })
    .catch(error => {
      console.error('Error getting Tokens:', error);
      res.send(`Error getting Tokens: ${error}`);
    });

  });

router.get('/user', async (req, res) => {
    spotifyApi.getMe()
    .then(
      async function(data) {
        res.send(data);
      }, function(err) {
        console.log('Something went wrong!', err);
      }
    );
  });

router.get('/refresh_token', async (req, res) => {

  const data = await spotifyApi.refreshAccessToken();
  req.session.access_token = data.body['access_token'];
  spotifyApi.setAccessToken(req.session.access_token);

  const responseData = {
    access_token : req.session.access_token,

  }
  const jsonContent = JSON.stringify(responseData);
  res.send(jsonContent);
  

});

router.get('/playlists', async (req, res) => {

  spotifyApi.getUserPlaylists().then(
    async function(data) {
      res.send(data);
    }, function(err) {
      console.log('Something went wrong!', err);
    }
  );
});

router.get('/playlist', async (req, res) => {

  const id = req.query.id;
  console.log(id);
  spotifyApi.getPlaylist(id).then(
    async function(data) {
      res.send(data);
    }, function(err) {
      console.log('Something went wrong!', err);
    }
  );
});

router.get('/moodplaylist', async (req, res) => {

    let playlistId;
    let trackUris;
    const mood = req.query.mood || "happy";
   

    // create playlist
    spotifyApi
    .getMySavedTracks({limit: 50
    })
        .then(async function(data) {
            let size = 50 > data.body.total ? data.body.total : 50;
            let tracks = data.body.items.map((item) => item.track);
            trackUris = await buildTracks(spotifyApi, tracks, size,mood);
            
            return spotifyApi
            .createPlaylist(`${mood} playlist`, { 'description': 'Mood based playlist', 'public': true })
            .then(async function(data) {
                playlistId = data.body['id'];
                return  spotifyApi.addTracksToPlaylist(playlistId, trackUris)
                    .then(function(data) {
                        const responseData = {
                          playlistId : playlistId,
                          trackUris : trackUris,
                      
                        }
                        const jsonContent = JSON.stringify(responseData);
                        res.send(jsonContent);
                    }) 
                    
                })
        })
    .catch(function(err) {
        console.log('Something went wrong!', err);
    });
    
});
export default router;