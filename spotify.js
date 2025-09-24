// Import configuration
import { API_URL } from './config.js';

// Spotify API URLs
const AUTHORIZE_URL = 'https://accounts.spotify.com/authorize';
const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const CURRENTLY_PLAYING_URL = 'https://api.spotify.com/v1/me/player/currently-playing';
const RECENTLY_PLAYED_URL = 'https://api.spotify.com/v1/me/player/recently-played';

let accessToken = null;
let refreshToken = null;

// Initialize Spotify integration
async function initializeSpotify() {
    try {
        const response = await fetch(`${API_URL}/spotify/login`);
        const data = await response.json();
        window.location.href = data.url;
    } catch (error) {
        console.error('Error initializing Spotify:', error);
    }
}

// Start periodic updates
function startUpdates() {
    updateNowPlaying();
    updateRecentlyPlayed();
    
    // Update currently playing every 5 seconds
    setInterval(updateNowPlaying, 5000);
    // Update recently played every minute
    setInterval(updateRecentlyPlayed, 60000);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('spotify-login');
    if (loginButton) {
        loginButton.addEventListener('click', initializeSpotify);
    }
    
    // Start updates if we're already logged in
    startUpdates();
});

// Update currently playing track
async function updateNowPlaying() {
    try {
        const response = await fetch(`${API_URL}/spotify/now-playing`, {
            credentials: 'include'
        });
        const data = await response.json();

        if (!data.isPlaying && !data.item) {
            document.getElementById('track-name').textContent = 'Not playing';
            document.getElementById('track-artist').textContent = '';
            document.getElementById('track-artwork').classList.add('hidden');
            return;
        }

        if (data.item) {
            document.getElementById('track-name').textContent = data.item.name;
            document.getElementById('track-artist').textContent = data.item.artists.map(artist => artist.name).join(', ');
            document.getElementById('track-artwork').src = data.item.album.images[0].url;
            document.getElementById('track-artwork').classList.remove('hidden');
            
            // Update progress bar
            const progress = (data.progress_ms / data.item.duration_ms) * 100;
            document.getElementById('progress').style.width = `${progress}%`;
        }
    } catch (error) {
        console.error('Error fetching now playing:', error);
        if (error.response?.status === 401) {
            refreshToken();
        }
    }
}

// Get recently played tracks
async function updateRecentlyPlayed() {
    try {
        const response = await fetch(`${API_URL}/spotify/recently-played`, {
            credentials: 'include'
        });
        const data = await response.json();

        const recentTracksContainer = document.getElementById('recent-tracks');
        recentTracksContainer.innerHTML = '';

        data.items.slice(0, 5).forEach(item => {
            const track = item.track;
            const trackElement = document.createElement('div');
            trackElement.classList.add('recent-track');
            
            trackElement.innerHTML = `
                <img src="${track.album.images[track.album.images.length - 1].url}" alt="${track.name}" class="recent-track-artwork">
                <div class="recent-track-info">
                    <div class="recent-track-name">${track.name}</div>
                    <div class="recent-track-artist">${track.artists.map(artist => artist.name).join(', ')}</div>
                </div>
            `;
            
            recentTracksContainer.appendChild(trackElement);
        });
    } catch (error) {
        console.error('Error fetching recently played:', error);
        if (error.response?.status === 401) {
            refreshToken();
        }
    }
}
            initializeSpotify(); // Re-authenticate if token is invalid
        
    


// Update recently played tracks
async function updateRecentlyPlayed() {
    try {
        const response = await fetch(`${API_URL}/spotify/recently-played`, {
            credentials: 'include'
        });
        const data = await response.json();
        const recentTracksContainer = document.getElementById('recent-tracks');
        recentTracksContainer.innerHTML = '';

        data.items.slice(0, 5).forEach(item => {
            const track = item.track;
            const trackElement = document.createElement('div');
            trackElement.classList.add('recent-track');
            trackElement.innerHTML = `
                <img src="${track.album.images[0].url}" alt="${track.album.name}" class="recent-track-artwork">
                <div class="recent-track-info">
                    <p class="track-name">${track.name}</p>
                    <p class="track-artist">${track.artists.map(artist => artist.name).join(', ')}</p>
                </div>
            `;
            recentTracksContainer.appendChild(trackElement);
        });
    } catch (error) {
        console.error('Error fetching recently played:', error);
        if (error.response?.status === 401) {
            initializeSpotify(); // Re-authenticate if token is invalid
        }
    }
}

// Refresh data periodically
setInterval(updateNowPlaying, 5000);

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initializeSpotify);