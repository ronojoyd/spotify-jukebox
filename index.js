require('dotenv').config();

const crypto = require('crypto');
const express = require('express');
const app = express();

const connectDB = require('./db');
const Session = require('./models/Session');

// Connecting to MongoDB
connectDB();

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

app.post('/create-session', async (req, res) => {
    try {

        if (!spotifyApi.getAccessToken()) {
            return res.status(401).send('Unauthorized: Please login to your Spotify account first.');
        }

        // Generate a random session ID
        const sessionId = crypto.randomBytes(4).toString('hex');  
        
        // Create a new session in the database
        const newSession = new Session({
            sessionId: sessionId,
            host: spotifyApi.getAccessToken(),  // Use host's Spotify access token to identify them
        });

        await newSession.save();

        res.json({ sessionId, message: 'New session created successfully!' });

    } catch (err) {

        console.error('Error creating session:', err);
        res.status(500).send('Error creating session');

    }
});

// Routes for users joining a jukebox session
app.post('/join-session', async (req, res) => {
    const { sessionId } = req.body;

    try {
        // Check if session exists
        const session = await Session.findOne({ sessionId });
        
        if (!session) {
            return res.status(404).send('Session not found');
        }

        res.json({ message: 'Session joined successfully', session });
    } catch (err) {
        console.error('Error joining session:', err);
        res.status(500).send('Error joining session');
    }
});

app.get('/', (req, res) => {
    res.send('Welcome to the Spotify Jukebox.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is up and running on port ${PORT}`);
});