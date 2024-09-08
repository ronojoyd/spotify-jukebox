const express = require('express');
const router = express.Router();
const SpotifyWebApi = require('spotify-web-api-node');

// Initialize Spotify API instance
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI
});

router.post('/play', async (req, res) => {
    const { accessToken, trackUri } = req.body;

    try {
        spotifyApi.setAccessToken(accessToken);
        await spotifyApi.play({ uris: [trackUri] });
        res.status(200).send('Playback started');
    } catch (error) {
        console.error('Error starting playback:', error);
        res.status(500).send('Error starting playback');
    }
});

router.post('/pause', async (req, res) => {
    const { accessToken } = req.body;

    try {
        spotifyApi.setAccessToken(accessToken);
        await spotifyApi.pause();
        res.status(200).send('Playback paused');
    } catch (error) {
        console.error('Error pausing playback:', error);
        res.status(500).send('Error pausing playback');
    }
});

router.post('/skip', async (req, res) => {
    const { accessToken } = req.body;

    try {
        spotifyApi.setAccessToken(accessToken);
        await spotifyApi.skipToNext();
        res.status(200).send('Skipped to next track');
    } catch (error) {
        console.error('Error skipping track:', error);
        res.status(500).send('Error skipping track');
    }
});

router.post('/seek', async (req, res) => {
    const { accessToken, positionMs } = req.body;

    try {
        spotifyApi.setAccessToken(accessToken);
        await spotifyApi.seek(positionMs);
        res.status(200).send('Playback position updated');
    } catch (error) {
        console.error('Error seeking position:', error);
        res.status(500).send('Error seeking position');
    }
});

module.exports = router;
