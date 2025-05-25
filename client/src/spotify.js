import axios from "axios";
import querystring from "querystring";


const FRONTEND_URI = process.env.REACT_APP_FRONTEND_URI;
const SERVER_URI = process.env.REACT_APP_SERVER_URI;

// Map for localStorage keys
const LOCALSTORAGE_KEYS = {
  accessToken: 'spotify_access_token',
  expireTime: 'spotify_token_expire_time',
  timestamp: 'spotify_token_timestamp',
}

// Map to retrieve localStorage values
const LOCALSTORAGE_VALUES = {
  accessToken: sessionStorage.getItem(LOCALSTORAGE_KEYS.accessToken),
  expireTime: sessionStorage.getItem(LOCALSTORAGE_KEYS.expireTime),
  timestamp: sessionStorage.getItem(LOCALSTORAGE_KEYS.timestamp),
};

  /**
 * Clear out all localStorage items we've set and reload the page
 * @returns {void}
 */
   const logoutUser = () => {
    // Clear all localStorage items
    console.log("remove storage");
    for (const property in LOCALSTORAGE_KEYS) {
      sessionStorage.removeItem(LOCALSTORAGE_KEYS[property]);
    }
    // Navigate to homepage
    window.location = window.location.origin;
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
    [LOCALSTORAGE_KEYS.expireTime]: urlParams.get('expires_in'),
  };
  
  const hasError = urlParams.get('error');
  
    

  // If there's an error OR the token in localStorage has expired, refresh the token
  if (hasError || hasTokenExpired() || LOCALSTORAGE_VALUES.accessToken === 'undefined') {
    refreshToken();
    console.log("it keeps refreshing");
    if(LOCALSTORAGE_VALUES.accessToken === 'undefined' || !LOCALSTORAGE_VALUES.accessToken){
      console.log("Try logging out");
      logoutUser();
      console.log("checking again. One more time");
    }
  }

  // If there is a valid access token in localStorage, use that
  if (LOCALSTORAGE_VALUES.accessToken && LOCALSTORAGE_VALUES.accessToken !== 'undefined') {
    console.log("valid access token in")
    return LOCALSTORAGE_VALUES.accessToken;
  }

  // If there is a token in the URL query params, user is logging in for the first time
  if (queryParams[LOCALSTORAGE_KEYS.accessToken]) {
    // Store the query params in localStorage
    for (const property in queryParams) {
      sessionStorage.setItem(property, queryParams[property]);
    }
    // Set timestamp
    sessionStorage.setItem(LOCALSTORAGE_KEYS.timestamp, Date.now());
    console.log("Are we here?");


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
  debugger;
  try {
    const { data } = await axios.get(`${SERVER_URI}/refresh_token`);

    console.log(data.access_token);
    console.log("changes");

    if(data.access_token === "undefined"){
      logoutUser();
    }
    else{
        // Update localStorage values
        sessionStorage.setItem(LOCALSTORAGE_KEYS.accessToken, data.access_token);
        sessionStorage.setItem(LOCALSTORAGE_KEYS.timestamp, Date.now());
        sessionStorage.setItem(LOCALSTORAGE_KEYS.expireTime, 3600);
        // Reload the page for localStorage updates to be reflected
        window.location.reload();
    }
  } catch (e) {
    console.error(e);
  }
};

const getMoodPlaylist = async (mood) => {
  try {
    const queryParams = querystring.stringify({
      mood
    });
    const { data } = await axios.get(`${SERVER_URI}/moodplaylist?${queryParams}`);
    wait(1000);
    let playlistId = data.playlistId;
    console.log(playlistId);
    wait(1000);
    window.location = `${FRONTEND_URI}/playlists/${playlistId}`;
  } catch (e) {
    console.error(e);
  }
};

function wait(ms){
  var start = new Date().getTime();
  var end = start;
  while(end < start + ms) {
    end = new Date().getTime();
 }
}


export const accessToken = getAccessToken();
export const getCurrentUserProfile = () => axios.get(`${SERVER_URI}/user`);
export const getPlaylists = () =>  axios.get(`${SERVER_URI}/playlists`);
export const getPlaylist = (id) => axios.get(`${SERVER_URI}/playlist?id=${id}`);
export const getMood = (mood) => getMoodPlaylist(mood);
export const logout = () => logoutUser();