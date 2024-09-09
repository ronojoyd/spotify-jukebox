let sessionId = '';

document.getElementById('create-session').addEventListener('click', async () => {
    try {
        const response = await fetch('/create-session', { method: 'POST' });
        const data = await response.json();

        sessionId = data.sessionId;
        alert(`Session Created! Your session ID is: ${data.sessionId}`);
    } catch (err) {
        console.error('Error creating session:', err);
    }
});

document.getElementById('join-session').addEventListener('click', async () => {
    const sessionId = document.getElementById('session-id').value;
    if (!sessionId) {
        alert('Please enter a session ID');
        return;
    }

    // try {
    //     const response = await fetch('/join-session', { method: 'POST' });
    //     const data = await response.json();
    // }

    alert(`Joining session with ID: ${sessionId}`);
});

document.getElementById('search-btn').addEventListener('click', async () => {

    const query = document.getElementById('search-query').value;
    if (!query) {
        alert('Please enter a song to search for');
        return;
    }

    try {
        const response = await fetch(`/search?query=${encodeURIComponent(query)}`);
        const tracks = await response.json();

        const searchResults = document.getElementById('search-results');
        searchResults.innerHTML = '';

        tracks.forEach(track => {
            const trackDiv = document.createElement('div');
            trackDiv.classList.add('track');
            
            trackDiv.innerHTML = `
                <strong>${track.name}</strong> by ${track.artist} 
                <button>Queue</button>
            `;

            // Attach the event listener to the button, passing the track object
            const button = trackDiv.querySelector('button');
            button.addEventListener('click', () => queueSong(sessionId, track));

            searchResults.appendChild(trackDiv);
        });

    } catch (err) {
        console.error('Error searching for tracks:', err);
    }
});

async function queueSong(sessionId, track) {

    console.log(`testing: ${sessionId}`);

    try {
        const response = await fetch('/add-to-queue', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sessionId, track })
        });
        const data = await response.json();
        alert(data.message);
    } catch (err) {
        console.error('Error queuing song:', err);
    }
}

document.getElementById('play-btn').addEventListener('click', async () => {
    try {
        const response = await fetch('/playback/play', { method: 'PUT' });
        const data = await response.json();
        alert(data.message);
    } catch (err) {
        console.error('Error starting playback:', err);
    }
});

document.getElementById('pause-btn').addEventListener('click', async () => {
    try {
        const response = await fetch('/playback/pause', { method: 'PUT' });
        const data = await response.json();
        alert(data.message);
    } catch (err) {
        console.error('Error pausing playback:', err);
    }
});

document.getElementById('next-btn').addEventListener('click', async () => {
    try {
        const response = await fetch('/playback/next', { method: 'POST' });
        const data = await response.json();
        alert(data.message);
    } catch (err) {
        console.error('Error skipping to next track:', err);
    }
});

document.getElementById('prev-btn').addEventListener('click', async () => {
    try {
        const response = await fetch('/playback/previous', { method: 'POST' });
        const data = await response.json();
        alert(data.message);
    } catch (err) {
        console.error('Error skipping to previous track:', err);
    }
});
