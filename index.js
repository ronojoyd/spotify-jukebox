require('dotenv').config();

// Setting up an Express instance
const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('Welcome to the Spotify Jukebox.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is up and running on port ${PORT}`);
});