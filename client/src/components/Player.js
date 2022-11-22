import { useState, useEffect } from "react";
import SpotifyPlayer from "react-spotify-web-playback";
import styled from 'styled-components/macro';

const StyledPlayerContainer = styled.a`
position: "absolute";
justifyContent: "space-between";
bottom: "0";
height: "65px";
width: "100%";
`;





export default function Player({ accessToken, playlistUri }) {
  const [play, setPlay] = useState(false);

  useEffect(() => setPlay(true), [playlistUri]);

  if (!accessToken) return null;
  return (
        <StyledPlayerContainer>
            <SpotifyPlayer
            autoPlay={true}
            token={accessToken}
            showSaveIcon
            callback={state => {
                if (!state.isPlaying) setPlay(false)
            }}
            play={play}
            uris={playlistUri ? [playlistUri] : []}
            magnifySliderOnHover={true}
                styles={{
                bgColor: '#282828',
                color: '#fff',
                sliderColor: '#1db954',
                sliderHandleColor: '#1cb954',
                trackNameColor: '#fff',
                }}
            />
        </StyledPlayerContainer>

  )
}