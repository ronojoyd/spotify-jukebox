require('dotenv').config();

const crypto = require('crypto');
const express = require('express');
const app = express();

const connectDB = require('./db');
const Session = require('./models/Session');

// Connecting to MongoDB
connectDB();

app.use(express.static('public'));

const SpotifyWebApi = require('spotify-web-api-node');

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI
});

// Adding playback controls
const playbackRoutes = require('./routes/playbackRoutes');

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

    // Creating the authorization URL
    const authorizeURL = spotifyApi.createAuthorizeURL(scopes);
    res.redirect(authorizeURL);
});

app.get('/callback', async (req, res) => {
    
    // Destructuring req.query for authorization code
    const { code } = req.query;

    try {

        // Exchanging the authorization code for an access token
        const data = await spotifyApi.authorizationCodeGrant(code);
        const { access_token, refresh_token } = data.body;

        // Setting the access token and refresh token
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

        // Generating a random session ID
        const sessionId = crypto.randomBytes(4).toString('hex');  
        
        // Creating a new session in the database
        const newSession = new Session({
            sessionId: sessionId,
            host: spotifyApi.getAccessToken(),
        });

        await newSession.save();

        res.json({ sessionId, message: 'New session created successfully!' });

    } catch (err) {

        console.error('Error creating session:', err);
        res.status(500).send('Error creating session');

    }
});

// Route for users joining a jukebox session
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

// Route for searching for songs using Spotify API
app.get('/search', async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).send('No search query provided');
    }

    try {

        console.log("Searching for a song...");

        // Using Spotify API to search for tracks
        const data = await spotifyApi.searchTracks(query);

        // Extracting track data from the Spotify API response
        const tracks = data.body.tracks.items.map(track => ({
            id: track.id,
            name: track.name,
            artist: track.artists[0].name,
            album: track.album.name,
            uri: track.uri
        }));

        // Sending back the list of tracks
        res.json(tracks);

    } catch (err) {

        console.error('Error searching for tracks:', err);
        res.status(500).send('Error searching for tracks');

    }
});

// Route for viewing a session's queue
// router.get('/queue/:sessionId', async (req, res) => {
//     const { sessionId } = req.params;

//     try {
//         const session = await Session.findById(sessionId);
//         if (!session) return res.status(404).send('Session not found');

//         res.json(session.queue);
//     } catch (error) {
//         console.error('Error retrieving queue:', error);
//         res.status(500).send('Error retrieving queue');
//     }
// });

app.use(express.json());

// Route for adding a song to the session queue
app.post('/add-to-queue', async (req, res) => {

    const { sessionId, track } = req.body;

    if (!sessionId || !track) {
        return res.status(400).send('Session ID and track information are required');
    }

    try {

        // Finding the session by sessionId
        const session = await Session.findOne({ sessionId });

        if (!session) {
            return res.status(404).send('Session not found');
        }

        // Adding the track to the song queue in MongoDB document
        session.songQueue.push(track);

        // Saving the updated session to the database
        await session.save();

        res.json({ message: 'Song added to queue', queue: session.songQueue });

    } catch (err) {

        console.error('Error adding song to queue:', err);
        res.status(500).send('Error adding song to queue');

    }
});

app.use('/playback', playbackRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to the Spotify Jukebox.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is up and running on port ${PORT}`);
});