package com.example.moodmusic;

import androidx.appcompat.app.AppCompatActivity;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;

import com.spotify.android.appremote.api.ConnectionParams;
import com.spotify.android.appremote.api.Connector;
import com.spotify.android.appremote.api.SpotifyAppRemote;

import kaaes.spotify.webapi.android.SpotifyApi;
import kaaes.spotify.webapi.android.SpotifyCallback;
import kaaes.spotify.webapi.android.SpotifyError;
import kaaes.spotify.webapi.android.SpotifyService;

import com.spotify.protocol.types.Track;

import android.util.Log;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import kaaes.spotify.webapi.android.models.Pager;
import kaaes.spotify.webapi.android.models.Playlist;
import kaaes.spotify.webapi.android.models.PlaylistTrack;
import kaaes.spotify.webapi.android.models.SavedTrack;
import kaaes.spotify.webapi.android.models.UserPrivate;
import retrofit.client.Response;

import android.widget.Toast;

public class MainActivity extends AppCompatActivity {

    static final String EXTRA_TOKEN = "EXTRA_TOKEN";
    private SpotifyAppRemote mSpotifyAppRemote;
    private static final String CLIENT_ID = Constants.clientId;
    private static final String REDIRECT_URI = Constants.redirectURI;

    private List<String> trackUris = new ArrayList<>();
    private Playlist userPlaylist;
    private String userId;
    private String playlistId;
    private String playlistUri;


    public static Intent createIntent(Context context) {
        return new Intent(context, MainActivity.class);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);


        Intent intent = getIntent();
        String token = intent.getStringExtra(EXTRA_TOKEN);
        SpotifyApi api = new SpotifyApi();
        api.setAccessToken(token);
        final SpotifyService spotify = api.getService();
        getUser(spotify);




    }

    @Override
    protected void onStart() {
        super.onStart();
        ConnectionParams connectionParams =
                new ConnectionParams.Builder(CLIENT_ID)
                        .setRedirectUri(REDIRECT_URI)
                        .showAuthView(true)
                        .build();

        SpotifyAppRemote.connect(this, connectionParams,
                new Connector.ConnectionListener() {

                    public void onConnected(SpotifyAppRemote spotifyAppRemote) {
                        mSpotifyAppRemote = spotifyAppRemote;
                        Log.d("MainActivity", "Connected! Yay!");

                        // Now you can start interacting with App Remote
                        connected();

                    }

                    public void onFailure(Throwable throwable) {
                        Log.e("MainActivity", throwable.getMessage(), throwable);

                        // Something went wrong when attempting to connect! Handle errors here
                    }
                });
    }

    @Override
    protected void onStop() {
        super.onStop();
        SpotifyAppRemote.disconnect(mSpotifyAppRemote);
    }

    private void connected() {
        // Play a playlist
        Log.v("MainActivity", "playlist id: " + playlistId);
        Log.v("MainActivity", "playlist uri: " + playlistUri);
        mSpotifyAppRemote.getPlayerApi().play(playlistUri);

        // Subscribe to PlayerState
        mSpotifyAppRemote.getPlayerApi()
                .subscribeToPlayerState()
                .setEventCallback(playerState -> {
                    final Track track = playerState.track;
                    if (track != null) {
                        Log.d("MainActivity", track.name + " by " + track.artist.name);
                    }
                });
    }


    private void getSongs(SpotifyService spotify) {
        spotify.getMySavedTracks(new SpotifyCallback<Pager<SavedTrack>>() {
            @Override
            public void success(Pager<SavedTrack> savedTrackPager, Response response) {
                // handle successful response
                for (int i = 0; i < savedTrackPager.items.size(); i++) {
                    trackUris.add(savedTrackPager.items.get(i).track.uri);
                    //getEmotion(savedTrackPager.items.get(i).track.id,spotify);
                    //if(trackEmotion == emotion)
                        trackUris.add(savedTrackPager.items.get(i).track.uri);
                }
            }

            @Override
            public void failure(SpotifyError error) {
                // handle error
                Log.v("MainActivity", "Error: " + error);
                Toast.makeText(getApplicationContext(), "Error: " + error, Toast.LENGTH_LONG).show();
            }
        });
    }

    private void createPlaylist(final SpotifyService spotify) {
        Map<String, Object> options = new HashMap<>();
        String playlistName = "Test Playlist";
        options.put("name", playlistName);
        getSongs(spotify);
        spotify.createPlaylist(userId, options, new SpotifyCallback<Playlist>() {
            @Override
            public void success(Playlist playlist, Response response) {
                userPlaylist = playlist;
                playlistId = userPlaylist.id;
                playlistUri = userPlaylist.uri;
                fillPlaylist(spotify);
            }

            @Override
            public void failure(SpotifyError error) {
                //handle error
                Log.v("MainActivity", "Error: " + error);
                Toast.makeText(getApplicationContext(), "Error: " + error, Toast.LENGTH_LONG).show();
            }
        });
    }

    private void fillPlaylist(SpotifyService spotify) {
        Map<String, Object> query = new HashMap<>();
        Map<String, Object> body = new HashMap<>();
        body.put("uris", trackUris);
        spotify.addTracksToPlaylist(userId, playlistId, query, body, new SpotifyCallback<Pager<PlaylistTrack>>() {
            @Override
            public void failure(SpotifyError error) {
                Log.v("MainActivity", "Error: " + error);
                Toast.makeText(getApplicationContext(), "Error: " + error, Toast.LENGTH_LONG).show();
            }

            @Override
            public void success(Pager<PlaylistTrack> playlistTrackPager, Response response) {
                Log.v("MainActivity", "Successfully added to playlist");
                Toast.makeText(getApplicationContext(), "Saved To Spotify Playlist :)", Toast.LENGTH_LONG).show();

            }
        });
    }

    private void getUser(final SpotifyService spotify) {
        spotify.getMe(new SpotifyCallback<UserPrivate>() {
            @Override
            public void failure(SpotifyError error) {
                Log.v("MainActivity", "Error: " + error);
                Toast.makeText(getApplicationContext(), "Error: " + error, Toast.LENGTH_LONG).show();
            }

            @Override
            public void success(UserPrivate userPrivate, Response response) {
                userId = userPrivate.id;
                createPlaylist(spotify);

            }
        });

    }
}