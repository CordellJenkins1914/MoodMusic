import { useState, useEffect } from 'react';
import { catchErrors } from '../utils';
import { getCurrentUserProfile, accessToken, getPlaylists } from '../spotify.js';
import { StyledHeader } from '../styles';
import {
  SectionWrapper,
  PlaylistsGrid,
  Loader
} from '../components';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [playlists, setPlaylists] = useState(null);

  useEffect(() => {
    if(accessToken){
      const fetchData = async () => {
          const user  = await getCurrentUserProfile();
          setProfile(user.data.body);
          console.log(user.data.body);

          const userPlaylists = await getPlaylists();
          setPlaylists(userPlaylists.data.body);

        } 
      catchErrors(fetchData());
    }   
  }, []);

  return (
    <>
      {profile && (
        <>
          <StyledHeader type="user">
            <div className="header__inner">
              {profile.images.length && profile.images[0].url && (
                <img className="header__img" src={profile.images[0].url} alt="Avatar"/>
              )}
              <div>
                <div className="header__overline">Profile</div>
                <h1 className="header__name">{profile.display_name}</h1>
                <p className="header__meta">
                  <span>
                    {profile.followers.total} Follower{profile.followers.total !== 1 ? 's' : ''}
                  </span>
                </p>
              </div>
            </div>
          </StyledHeader>

          <main>
          {playlists ? (
              <SectionWrapper title="Playlists" seeAllLink="/playlists">
                <PlaylistsGrid playlists={playlists.items.slice(0, 10)} />
              </SectionWrapper>
            
          ) : (
            <Loader />
          )}
          </main>
        </>
      )}
    </>
  )
};

export default Profile;