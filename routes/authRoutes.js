import express from "express";
const router = express.Router();
import SpotifyWebApi from "spotify-web-api-node";
import buildTracks from '../utils/buildTracks.js'
import generateRandomString from "../utils/generateRandomString.js";
import querystring from "querystring";

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECTURI;


const encodeFormData = (data) => {
    return Object.keys(data)
      .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
      .join('&');
  }


  const scopes = [
    `user-modify-playback-state
    user-read-playback-state
    user-read-currently-playing
    user-library-modify
    user-library-read
    user-top-read
    playlist-read-private
    playlist-modify-public`
];

    const state = generateRandomString(16);

    var spotifyApi = new SpotifyWebApi({
        redirectUri: REDIRECT_URI,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET
    });

    let authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);


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

      const access_token = data.body['access_token'];
      const refresh_token = data.body['refresh_token'];
      const expires_in = data.body['expires_in'];


      spotifyApi.setAccessToken(access_token);
      spotifyApi.setRefreshToken(refresh_token);

      console.log('access_token:', access_token);
      console.log('refresh_token:', refresh_token);

      console.log(
        `Sucessfully retreived access token. Expires in ${expires_in} s.`
      );
      
      const queryParams = querystring.stringify({
        access_token,
        refresh_token,
        expires_in,
      });

      res.redirect(`http://localhost:3000/?${queryParams}`);

      setInterval(async () => {
        const data = await spotifyApi.refreshAccessToken();
        const access_token = data.body['access_token'];

        console.log('The access token has been refreshed!');
        console.log('access_token:', access_token);
        spotifyApi.setAccessToken(access_token);
        
      }, expires_in / 2 * 1000);
    })
    .catch(error => {
      console.error('Error getting Tokens:', error);
      res.send(`Error getting Tokens: ${error}`);
    });

  });

router.get('/user', async (req, res) => {
    spotifyApi.getMe()
        .then(async function(data) {
            res.send(`<pre>${JSON.stringify(data.body, null, 2)}</pre>`);
        }, function(err) {
    console.log('Something went wrong!', err);
  });
});

router.get('/refresh_token', (req, res) => {
  const access_token  = spotifyApi.getAccessToken();

  const responseData = {
    access_token : access_token,

  }
  const jsonContent = JSON.stringify(responseData);
  res.send(jsonContent);
  

});

router.get('/playlist', async (req, res) => {

    let playlistId;
    let trackUris;

    // create playlist

    spotifyApi
    .getMySavedTracks({
    })
        .then(async function(data) {
            console.log('Done!');
            let size = data.body.total;
            let tracks = data.body.items.map((item) => item.track);
            trackUris = await buildTracks(spotifyApi, tracks, size);
            
            return spotifyApi
            .createPlaylist('Mood playlist', { 'description': 'Mood baed playlist', 'public': true })
            .then(async function(data) {
                console.log('Created playlist!');
                playlistId = data.body['id'];
                return  spotifyApi.getMySavedTracks({
                })
                .then(async function(data) {
                    console.log('Done!');
                
                })
                .then(async function(data) {
                    console.log(playlistId);
                    spotifyApi.addTracksToPlaylist(playlistId, trackUris)
                    .then(function(data) {
                        console.log("added songs to playlist");
                    }) 
                    
                })
        })
    })
    .catch(function(err) {
        console.log('Something went wrong!', err);
    });
    
});
export default router;