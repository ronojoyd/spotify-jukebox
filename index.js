require('dotenv').config();

const express = require('express');
const app = express();

const SpotifyWebApi = require('spotify-web-api-node');

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI
});

app.get('/login', (req, res) => {
    const scopes = [
        'user-read-playback-state',
        'user-modify-playback-state',
        'user-read-currently-playing',
        'playlist-read-private',
        'playlist-modify-public',
        'streaming',
        'user-read-email',
        'user-read-private'
    ];

    // Create the authorization URL
    const authorizeURL = spotifyApi.createAuthorizeURL(scopes);
    res.redirect(authorizeURL);
});
app.get('/callback', async (req, res) => {
    
    // Destructuring req.query for authorization code
    const { code } = req.query;

    try {

        // Exchange the authorization code for an access token
        const data = await spotifyApi.authorizationCodeGrant(code);
        const { access_token, refresh_token } = data.body;

        // Set the access token and refresh token
        spotifyApi.setAccessToken(access_token);
        spotifyApi.setRefreshToken(refresh_token);

        res.send('Logged in successfully!');

    } catch (err) {

        console.error('Error during Spotify authentication', err);
        res.send('Error during login');

    }
});

app.get('/', (req, res) => {
    res.send('Welcome to the Spotify Jukebox.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is up and running on port ${PORT}`);
});