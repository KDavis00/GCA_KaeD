require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const fetch = require('node-fetch');
const config = require('./config');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS configuration
app.use(cors(config.cors));

app.use(express.json());

// Root route
app.get('/', (req, res) => {
    res.json({ 
        message: 'Spotify Portfolio API is running',
        endpoints: {
            login: '/api/spotify/login',
            nowPlaying: '/api/spotify/now-playing',
            recentlyPlayed: '/api/spotify/recently-played'
        }
    });
});
app.use(session({
    secret: config.app.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Spotify API URLs
const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_CURRENTLY_PLAYING_URL = 'https://api.spotify.com/v1/me/player/currently-playing';
const SPOTIFY_RECENTLY_PLAYED_URL = 'https://api.spotify.com/v1/me/player/recently-played';

// Initialize Spotify auth
app.get('/api/spotify/login', (req, res) => {
    const scope = 'user-read-currently-playing user-read-recently-played';
    const redirectUri = `${process.env.FRONTEND_URL}/callback`;
    
    const params = new URLSearchParams({
        client_id: process.env.SPOTIFY_CLIENT_ID,
        response_type: 'code',
        redirect_uri: redirectUri,
        scope: scope,
    });

    res.json({ url: `${SPOTIFY_AUTH_URL}?${params.toString()}` });
});

// Handle the callback from Spotify
app.get('/api/spotify/callback', async (req, res) => {
    const { code } = req.query;
    const redirectUri = `${process.env.FRONTEND_URL}/callback`;

    try {
        const response = await fetch(SPOTIFY_TOKEN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + Buffer.from(
                    process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
                ).toString('base64')
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: redirectUri
            })
        });

        const data = await response.json();
        req.session.tokens = {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresIn: Date.now() + data.expires_in * 1000
        };

        res.redirect(process.env.FRONTEND_URL);
    } catch (error) {
        console.error('Error getting tokens:', error);
        res.status(500).json({ error: 'Failed to get tokens' });
    }
});

// Middleware to check and refresh token if needed
const checkAndRefreshToken = async (req, res, next) => {
    if (!req.session.tokens) {
        return res.status(401).json({ error: 'No token available' });
    }

    if (Date.now() > req.session.tokens.expiresIn) {
        try {
            const response = await fetch(SPOTIFY_TOKEN_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + Buffer.from(
                        process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
                    ).toString('base64')
                },
                body: new URLSearchParams({
                    grant_type: 'refresh_token',
                    refresh_token: req.session.tokens.refreshToken
                })
            });

            const data = await response.json();
            req.session.tokens = {
                ...req.session.tokens,
                accessToken: data.access_token,
                expiresIn: Date.now() + data.expires_in * 1000
            };
        } catch (error) {
            console.error('Error refreshing token:', error);
            return res.status(401).json({ error: 'Failed to refresh token' });
        }
    }
    next();
};

// Get currently playing track
app.get('/api/spotify/now-playing', checkAndRefreshToken, async (req, res) => {
    try {
        const response = await fetch(SPOTIFY_CURRENTLY_PLAYING_URL, {
            headers: {
                'Authorization': `Bearer ${req.session.tokens.accessToken}`
            }
        });

        if (response.status === 204) {
            return res.json({ isPlaying: false });
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching now playing:', error);
        res.status(500).json({ error: 'Failed to fetch currently playing track' });
    }
});

// Get recently played tracks
app.get('/api/spotify/recently-played', checkAndRefreshToken, async (req, res) => {
    try {
        const response = await fetch(SPOTIFY_RECENTLY_PLAYED_URL, {
            headers: {
                'Authorization': `Bearer ${req.session.tokens.accessToken}`
            }
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching recently played:', error);
        res.status(500).json({ error: 'Failed to fetch recently played tracks' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});