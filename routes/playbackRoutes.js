const express = require('express');
const router = express.Router();

const SpotifyWebApi = require('spotify-web-api-node');

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI
});

// Playing a song
router.put('/play', async (req, res) => {
    try {

        const accessToken = spotifyApi.getAccessToken();
        if (!accessToken) {
            return res.status(401).send('Unauthorized: Please log in first.');
        }

        await spotifyApi.play();
        res.json({ message: 'Playback started' });

    } catch (err) {

        console.error('Error starting playback:', err);
        res.status(500).send('Error starting playback');

    }
});

// Pausing playback
router.put('/pause', async (req, res) => {
    try {

        const accessToken = spotifyApi.getAccessToken();
        if (!accessToken) {
            return res.status(401).send('Unauthorized: Please log in first.');
        }

        await spotifyApi.pause();
        res.json({ message: 'Playback paused' });

    } catch (err) {

        console.error('Error pausing playback:', err);
        res.status(500).send('Error pausing playback');

    }
});

// Skipping to next track
router.post('/next', async (req, res) => {
    try {

        const accessToken = spotifyApi.getAccessToken();
        if (!accessToken) {
            return res.status(401).send('Unauthorized: Please log in first.');
        }

        await spotifyApi.skipToNext();
        res.json({ message: 'Skipped to next track' });

    } catch (err) {

        console.error('Error skipping to next track:', err);
        res.status(500).send('Error skipping to next track');

    }
});

// Skipping to previous track
router.post('/previous', async (req, res) => {
    try {

        const accessToken = spotifyApi.getAccessToken();
        if (!accessToken) {
            return res.status(401).send('Unauthorized: Please log in first.');
        }

        await spotifyApi.skipToPrevious();
        res.json({ message: 'Skipped to previous track' });

    } catch (err) {

        console.error('Error skipping to previous track:', err);
        res.status(500).send('Error skipping to previous track');

    }
});

// Queuing a song
router.post('/queue', async (req, res) => {

    const { uri } = req.body;
    if (!uri) {
        return res.status(400).send('No track URI provided');
    }

    try {

        const accessToken = spotifyApi.getAccessToken();
        if (!accessToken) {
            return res.status(401).send('Unauthorized: Please log in first.');
        }

        await spotifyApi.addToQueue(uri);
        res.json({ message: 'Song queued for playback' });

    } catch (err) {

        console.error('Error queuing song:', err);
        res.status(500).send('Error queuing song');

    }
});

module.exports = router;