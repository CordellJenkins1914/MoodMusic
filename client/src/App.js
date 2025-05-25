import { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';
import { accessToken, logout } from './spotify.js';
import { Login, Profile, Playlists, Playlist, Mood } from './pages';
import { GlobalStyle } from './styles';
import styled from 'styled-components/macro';

const FRONTEND_URI = process.env.REACT_APP_FRONTEND_URI;

function App() {

  const StyledLogoutButton = styled.button`
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-md);
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: rgba(0,0,0,.7);
  color: var(--white);
  font-size: var(--fz-sm);
  font-weight: 700;
  border-radius: var(--border-radius-pill);
  z-index: 10;
  @media (min-width: 768px) {
    right: var(--spacing-lg);
  }
`;

const StyledHomeButton = styled.button`
color: var(--white);
font-size: 1em;
margin: 1em;
padding: 0.25em 1em;
border: 2px solid black;
border-radius: 3px;
display: block;
`;
const StyledMoodButton = styled.button`
color: var(--white);
font-size: 1em;
margin: 1em;
padding: .025em 1em;
border: 2px solid black;
border-radius: 3px;
display: block;
`

  function ScrollToTop() {
    const { pathname } = useLocation();
  
    useEffect(() => {
      window.scrollTo(0, 0);
    }, [pathname]);
  
    return null;
  }

  const [token, setToken] = useState(null);

  useEffect(() => {
    setToken(accessToken);
  }, []);

  function home() {
    window.location.href = `${FRONTEND_URI}`;
  }
  function mood() {
    window.location.href = `${FRONTEND_URI}/mood`;
  }

  return (
    <div className="App">
      <GlobalStyle />

      <header className="App-header">
        {!token ? (
          <Login />
        ) : (
          <>
          <StyledLogoutButton onClick={logout}>Log Out</StyledLogoutButton>
          <StyledHomeButton onClick={home}> Home</StyledHomeButton>
          <StyledMoodButton onClick={mood}>Mood</StyledMoodButton>
          <Router>
            <ScrollToTop />
            <Routes>
            <Route path="/mood" element={<Mood />} />
            <Route path="/playlists/:id" element={<Playlist />} />
            <Route path="/playlists" element={<Playlists />} />
              <Route path="/" element={<Profile />}>
              </Route>
            </Routes>
          </Router>
          </>
        )}
      </header>
    </div>
  );
}

export default App;