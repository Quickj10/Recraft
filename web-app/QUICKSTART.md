# Quick Start Guide

## 1. Install Dependencies

Open a terminal in the `web-app` directory and run:

```bash
npm install
```

This will install Vite development server.

## 2. Configure API Token

Edit `config.js` and replace `your_api_token_here` with your actual Replicate API token:

```javascript
REPLICATE_API_TOKEN: 'r8_your_actual_token_here'
```

Get your token from: https://replicate.com/account/api-tokens

## 3. Start Development Server

Run:

```bash
npm run dev
```

The app will automatically open in your browser at http://localhost:5173

## 4. Use the App

- **Upload Images**: Drag and drop images or click the upload zone
- **Random Generation**: Click "🎲 Random Generation" button
- **Manual Generation**: Click "✏️ Manual Generation" to specify exact prompts
- **Batch Processing**: Click "📦 Batch Processing" for multiple images

## Troubleshooting

- **Port already in use**: Vite will try a different port automatically
- **API errors**: Make sure your API token is correct and billing is set up
- **CORS errors**: If you get CORS errors, you may need to use a backend proxy

## Notes

- Generated images are stored in browser localStorage
- Images will persist until you clear browser data
- API key is visible in browser - this is fine for personal use

