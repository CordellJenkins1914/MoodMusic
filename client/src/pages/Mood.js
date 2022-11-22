import { useState, useEffect } from 'react';
import { catchErrors } from '../utils';
import { getCurrentUserProfile } from '../spotify.js';
import { StyledHeader } from '../styles';
import { Dropdown } from '../components';

const Mood = () => {

        const [profile, setProfile] = useState(null);

        useEffect(() => {
            const fetchData = async () => {
                const data  = await getCurrentUserProfile();
                setProfile(data.body);
      
              } 
            catchErrors(fetchData()); 
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

            <Dropdown />

            </>
          )}
        </>
      )
}

export default Mood;