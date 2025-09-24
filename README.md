# Kae Davis – Personal Web Portfolio

This is a personal portfolio website for Kae Davis, built with HTML, CSS, and Node.js. It features a clean design, technical skills showcase, and real-time Spotify integration to display currently playing music.

## Live Preview

Frontend: https://kdavis00.github.io/# GCA_KaeD

## Secure Deployment Guide

This application uses a two-part deployment strategy to keep sensitive information secure:

1. Frontend (GitHub Pages):
   - Contains only static files (HTML, CSS, JS)
   - No sensitive information stored here
   - Hosted at: https://kdavis00.github.io/GCA_KaeD

2. Backend (Render.com):
   - Handles all Spotify API communication
   - Stores sensitive credentials securely
   - Manages user sessions and authentication

### Security Measures

1. **Environment Variables**:
   - Never commit `.env` file to the repository
   - Use `.env.example` as a template
   - Store sensitive data on Render.com's environment variables

2. **API Keys**:
   - Spotify credentials are only stored on the backend
   - Never exposed to the frontend or GitHub repository

3. **CORS Configuration**:
   - Backend only accepts requests from authorized domains
   - Prevents unauthorized API access

### Setup Instructions

1. **Spotify Developer Account**:
   - Create account at developer.spotify.com
   - Create a new application
   - Get Client ID and Secret
   - Add redirect URIs for both development and production

2. **Backend (Render.com)**:
   - Create new Web Service
   - Add environment variables from `.env.example`
   - Use your actual Spotify credentials
   - Set `NODE_ENV=production`

3. **Frontend (GitHub Pages)**:
   - Update `config.js` with your Render.com backend URL
   - Deploy to GitHub Pages
   - Never commit sensitive information

### Local Development

1. Copy `.env.example` to `.env`
2. Add your Spotify credentials to `.env`
3. Run the backend locally: `npm run dev`
4. Test frontend with local backend/  
Backend API: https://gca-kaed.onrender.com

## Features

- Clean, responsive layout
- Personal mission section
- Skill badges with Devicon icons
- Real-time Spotify integration showing:
  - Currently playing track
  - Recently played tracks
- Secure authentication with Spotify API
- Easy to customize and extend

## Technologies Used

### Frontend
- HTML5
- CSS3
- JavaScript
- Devicon (for skill icons)

### Backend
- Node.js
- Express.js
- Spotify Web API
- Express Session
- CORS security
- Environment variables for secure configuration

## Deployment

- Frontend hosted on GitHub Pages
- Backend API hosted on Render.com
- Secure environment variable management
- CORS configured for secure cross-origin requests

## Getting Started

1. Clone the repository
2. Set up Spotify Developer credentials
3. Configure environment variables (see `.env.example`)
4. Install dependencies:
   ```bash
   cd server
   npm install
   ```
5. Start the server:
   ```bash
   npm start
   ```

## Credits

- Icons provided by [Devicon](https://devicon.dev/)
- Spotify integration via [Spotify Web API](https://developer.spotify.com/documentation/web-api/)
- GIF source: (Add your source here if needed)
