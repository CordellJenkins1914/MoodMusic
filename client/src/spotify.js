import axios from "axios";
import SpotifyWebApi from "spotify-web-api-node";
import querystring from "querystring";

var spotifyApi = new SpotifyWebApi({
});

const FRONTEND_URI = process.env.REACT_APP_FRONTEND_URI;
const SERVER_URI = process.env.REACT_APP_SERVER_URI;

// Map for localStorage keys
const LOCALSTORAGE_KEYS = {
  accessToken: 'spotify_access_token',
  refreshToken: 'spotify_refresh_token',
  expireTime: 'spotify_token_expire_time',
  timestamp: 'spotify_token_timestamp',
}

// Map to retrieve localStorage values
const LOCALSTORAGE_VALUES = {
  accessToken: window.localStorage.getItem(LOCALSTORAGE_KEYS.accessToken),
  refreshToken: window.localStorage.getItem(LOCALSTORAGE_KEYS.refreshToken),
  expireTime: window.localStorage.getItem(LOCALSTORAGE_KEYS.expireTime),
  timestamp: window.localStorage.getItem(LOCALSTORAGE_KEYS.timestamp),
};
/**
 * Handles logic for retrieving the Spotify access token from localStorage
 * or URL query params
 * @returns {string} A Spotify access token
 */
const getAccessToken = () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const queryParams = {
    [LOCALSTORAGE_KEYS.accessToken]: urlParams.get('access_token'),
    [LOCALSTORAGE_KEYS.refreshToken]: urlParams.get('refresh_token'),
    [LOCALSTORAGE_KEYS.expireTime]: urlParams.get('expires_in'),
  };
  
  const hasError = urlParams.get('error');
  

    

  // If there's an error OR the token in localStorage has expired, refresh the token
  if (hasError || hasTokenExpired() || LOCALSTORAGE_VALUES.accessToken === 'undefined') {
    refreshToken();
  }

  // If there is a valid access token in localStorage, use that
  if (LOCALSTORAGE_VALUES.accessToken && LOCALSTORAGE_VALUES.accessToken !== 'undefined') {
    spotifyApi.setAccessToken(LOCALSTORAGE_VALUES.accessToken);
    return LOCALSTORAGE_VALUES.accessToken;
  }

  // If there is a token in the URL query params, user is logging in for the first time
  if (queryParams[LOCALSTORAGE_KEYS.accessToken]) {
    // Store the query params in localStorage
    for (const property in queryParams) {
      window.localStorage.setItem(property, queryParams[property]);
    }
    // Set timestamp
    window.localStorage.setItem(LOCALSTORAGE_KEYS.timestamp, Date.now());

    spotifyApi.setAccessToken(queryParams[LOCALSTORAGE_KEYS.accessToken]);

    window.location = window.location.origin;
    // Return access token from query params
    return queryParams[LOCALSTORAGE_KEYS.accessToken];
  }

  // We should never get here!
  return false;
};



/**
 * Checks if the amount of time that has elapsed between the timestamp in localStorage
 * and now is greater than the expiration time of 3600 seconds (1 hour).
 * @returns {boolean} Whether or not the access token in localStorage has expired
 */
 const hasTokenExpired = () => {
  const { accessToken, timestamp, expireTime } = LOCALSTORAGE_VALUES;
  if (!accessToken || !timestamp) {
    return false;
  }
  const millisecondsElapsed = Date.now() - Number(timestamp);
  return (millisecondsElapsed / 1000) > Number(expireTime);
};


/**
 * Use the refresh token in localStorage to hit the /refresh_token endpoint
 * in our Node app, then update values in localStorage with data from response.
 * @returns {void}
 */
 const refreshToken = async () => {
  try {
    // Use `/refresh_token` endpoint from our Node app
    const { data } = await axios.get(`${SERVER_URI}/refresh_token`);

    console.log(data.access_token);

    // Update localStorage values
    window.localStorage.setItem(LOCALSTORAGE_KEYS.accessToken, data.access_token);
    window.localStorage.setItem(LOCALSTORAGE_KEYS.timestamp, Date.now());
    spotifyApi.setAccessToken(data.access_token);
    // Reload the page for localStorage updates to be reflected
    window.location.reload();

  } catch (e) {
    console.error(e);
  }
};
const getUser = () => spotifyApi.getMe().then(
  async function(data) {
    console.log(FRONTEND_URI);
      return data;
    }, function(err) {
    console.log('Something went wrong!', err);
  }
);

const getUserPlaylist = (id) => spotifyApi.getPlaylist(id).then(
  async function(data) {
    return data;
  }, function(err) {
    console.log('Something went wrong!', err);
  }
);

const getMoodPlaylist = async (mood) => {
  try {
    const queryParams = querystring.stringify({
      mood
    });
    const { data } = await axios.get(`${SERVER_URI}/playlist?${queryParams}`);
    let playlistId = data.playlistId;
    console.log(playlistId)
    window.location.href = `${FRONTEND_URI}/playlists/${playlistId}`;
  } catch (e) {
    console.error(e);
  }
};

const getCurrentUserPlaylists = () => spotifyApi.getUserPlaylists().then(
  async function(data) {
    return data;
  }, function(err) {
    console.log('Something went wrong!', err);
  }
);


export const accessToken = getAccessToken();
/**
 * Clear out all localStorage items we've set and reload the page
 * @returns {void}
 */
 export const logout = () => {
  // Clear all localStorage items
  for (const property in LOCALSTORAGE_KEYS) {
    window.localStorage.removeItem(LOCALSTORAGE_KEYS[property]);
  }
  // Navigate to homepage
  window.location = window.location.origin;
};

export const getCurrentUserProfile = () => getUser();
export const getPlaylists = () => getCurrentUserPlaylists();
export const getPlaylist = (id) => getUserPlaylist(id);
export const getMood = (mood) => getMoodPlaylist(mood);