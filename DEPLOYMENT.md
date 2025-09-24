# Deployment Instructions

## Local Development
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Update `.env` with your Spotify API credentials and other configuration
3. Never commit the `.env` file to git (it's already in .gitignore)

## Deploying to Render.com
1. Push your code to GitHub (sensitive data is protected by .gitignore)
2. Go to render.com and create a new Web Service
3. Connect your GitHub repository
4. Under "Environment Variables", set up these secret values:
   - SPOTIFY_CLIENT_ID (from your Spotify Developer Dashboard)
   - SPOTIFY_CLIENT_SECRET (from your Spotify Developer Dashboard)
   The other variables are already configured in render.yaml

## GitHub Pages Deployment
1. Your frontend will be served from GitHub Pages
2. The backend API URL will be your render.com service URL
3. Make sure to update the FRONTEND_URL in render.yaml to match your GitHub Pages URL

## Security Notes
- Never commit sensitive information to git
- Always use environment variables for secrets
- The .env file is for local development only
- Render.com securely manages your production environment variables