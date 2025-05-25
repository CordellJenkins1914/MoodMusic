import { Link } from 'react-router-dom';
import { StyledGrid } from '../styles';

const PlaylistsGrid = ({ playlists = [] }) => {
  if (playlists.total === 0) {
    return <p className="empty-notice">No playlists available</p>;
  }

  return (
    <StyledGrid>
      {playlists.map((playlist, i) => (
        <li className="grid__item" key={i}>
          <Link className="grid__item__inner" to={`/playlists/${playlist.id}`}>
            {playlist.images?.[0]?.url && (
              <div className="grid__item__img">
                <img src={playlist.images[0].url} alt={playlist.name} />
              </div>
            )}
            <h3 className="grid__item__name overflow-ellipsis">{playlist.name}</h3>
            <p className="grid__item__label">Playlist</p>
          </Link>
        </li>
      ))}
    </StyledGrid>
  );
};

export default PlaylistsGrid;