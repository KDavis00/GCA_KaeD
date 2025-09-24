const config = {
    spotify: {
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET
    },
    app: {
        frontendUrl: process.env.NODE_ENV === 'production' 
            ? 'https://kdavis00.github.io/GCA_KaeD'  // Full GitHub Pages URL
            : 'http://127.0.0.1:3000',
        port: process.env.PORT || 5000,
        sessionSecret: process.env.SESSION_SECRET || 'your-secret-key'
    },
    cors: {
        origin: process.env.NODE_ENV === 'production'
            ? ['https://kdavis00.github.io', 'https://kdavis00.github.io/GCA_KaeD']  // Both URLs for GitHub Pages
            : ['http://127.0.0.1:3000'],
        credentials: true
    }
};

module.exports = config;