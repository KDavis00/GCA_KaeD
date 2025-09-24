require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const fetch = require('node-fetch');
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
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? 'https://kdavis00.github.io'
        : process.env.FRONTEND_URL,
    credentials: true
}));

app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
}));

// Spotify API URLs
const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_CURRENTLY_PLAYING_URL = 'https://api.spotify.com/v1/me/player/currently-playing';
const SPOTIFY_RECENTLY_PLAYED_URL = 'https://api.spotify.com/v1/me/player/recently-played';

// Health check endpoint for Render
app.get('/', (req, res) => {
    res.json({ status: 'Server is running' });
});

// Spotify authentication endpoint
app.get('/spotify/login', (req, res) => {
    const scope = 'user-read-currently-playing user-read-recently-played';
    const state = Math.random().toString(36).substring(7);
    
    const authQueryParams = new URLSearchParams({
        response_type: 'code',
        client_id: process.env.SPOTIFY_CLIENT_ID,
        scope: scope,
        redirect_uri: process.env.REDIRECT_URI,
        state: state
    }).toString();

    res.json({ url: `${SPOTIFY_AUTH_URL}?${authQueryParams}` });
});

// Spotify callback endpoint
app.get('/callback', async (req, res) => {
    const code = req.query.code;

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
                code: code,
                redirect_uri: process.env.REDIRECT_URI,
                grant_type: 'authorization_code'
            })
        });

        const data = await response.json();
        req.session.access_token = data.access_token;
        req.session.refresh_token = data.refresh_token;
        
        res.redirect(process.env.FRONTEND_URL);
    } catch (error) {
        console.error('Error in callback:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
});

// Get currently playing track
app.get('/spotify/now-playing', async (req, res) => {
    if (!req.session.access_token) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const response = await fetch(SPOTIFY_CURRENTLY_PLAYING_URL, {
            headers: {
                'Authorization': `Bearer ${req.session.access_token}`
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
app.get('/spotify/recently-played', async (req, res) => {
    if (!req.session.access_token) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const response = await fetch(SPOTIFY_RECENTLY_PLAYED_URL, {
            headers: {
                'Authorization': `Bearer ${req.session.access_token}`
            }
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching recently played:', error);
        res.status(500).json({ error: 'Failed to fetch recently played tracks' });
    }
});

// Initialize Spotify auth
app.get('/api/spotify/login', (req, res) => {
    const scope = 'user-read-currently-playing user-read-recently-played';
    const redirectUri = process.env.NODE_ENV === 'production'
        ? 'https://kdavis00.github.io/callback'
        : `${process.env.FRONTEND_URL}/callback`;
    
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
    const redirectUri = process.env.NODE_ENV === 'production'
        ? 'https://kdavis00.github.io/callback'
        : `${process.env.FRONTEND_URL}/callback`;

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

        res.redirect(process.env.NODE_ENV === 'production'
            ? 'https://kdavis00.github.io'
            : process.env.FRONTEND_URL);
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