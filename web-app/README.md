# Recraft V3 Web App

A beautiful web application for generating new variations of your branding and icon designs using Recraft V3 via Replicate API.

## Features

- 🎲 **Random Generation**: Generate random variations with style presets
- ✏️ **Manual Generation**: Full control over prompts, size, and seed
- 📦 **Batch Processing**: Generate multiple images from a list of prompts
- 🖼️ **Image Gallery**: Visual gallery with drag-and-drop upload
- 📥 **Download**: Download generated images with metadata
- 🎨 **Modern UI**: Clean, dark-themed interface

## Setup

### 1. Configure API Token

Edit `config.js` and replace `your_api_token_here` with your actual Replicate API token:

```javascript
REPLICATE_API_TOKEN: 'your_api_token_here'
```

Get your token from: https://replicate.com/account/api-tokens

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

The app will open at http://localhost:5173

## Usage

1. **Upload Images**: Drag and drop images or click the upload zone to browse
2. **Random Generation**: Click "🎲 Random Generation" to generate random variations
3. **Manual Generation**: Click "✏️ Manual Generation" to specify exact prompts and parameters
4. **Batch Processing**: Click "📦 Batch Processing" to generate multiple images at once
5. **View & Download**: Click on generated images to view details and download

## Project Structure

```
web-app/
├── index.html      # Main HTML page
├── styles.css      # Styling
├── app.js          # Main application logic
├── api.js          # Replicate API client
├── config.js       # Configuration (API key, settings)
├── package.json    # Dependencies
└── vite.config.js  # Vite configuration
```

## Notes

- API key is stored in `config.js` (visible in browser - fine for personal use)
- Generated images are stored in browser localStorage
- Source images are loaded via drag-and-drop
- Make sure billing is set up on Replicate: https://replicate.com/account/billing

## Troubleshooting

- **API Token Error**: Make sure you've set your token in `config.js`
- **CORS Issues**: Replicate API should support browser requests. If issues occur, consider using a backend proxy.
- **Slow Generation**: Image generation takes 10-30 seconds depending on complexity

