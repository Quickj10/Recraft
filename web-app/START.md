# How to Start the Application

The app requires **two servers** to be running:

1. **Backend Proxy Server** (handles API calls, avoids CORS)
2. **Frontend Dev Server** (serves the web app)

## Start Both Servers

### Option 1: Two Terminal Windows (Easiest)

**Terminal 1 - Backend Proxy:**
```bash
cd web-app
npm run server
```
This will start the proxy server on http://localhost:3000

**Terminal 2 - Frontend Dev Server:**
```bash
cd web-app
npm run dev
```
This will start Vite on http://localhost:5173

Then open your browser to **http://localhost:5173**

### Option 2: Single Command (PowerShell)

```powershell
cd web-app
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run server"; npm run dev
```

This opens a new PowerShell window for the backend and runs the frontend in the current window.

## What Each Server Does

- **Backend Proxy (port 3000)**: Handles Replicate API calls to avoid CORS issues. Reads API token from `config.js`.
- **Frontend Dev Server (port 5173)**: Serves the web app with hot reload.

## Troubleshooting

- **CORS errors**: Make sure the backend proxy server is running on port 3000
- **Connection refused**: Check that both servers are running
- **API token errors**: Verify your token is set in `config.js`

