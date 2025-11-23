// Simple Express proxy server to handle Replicate API calls
import express from 'express';
import cors from 'cors';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Read API token from config.js
function getApiToken() {
  try {
    const configPath = join(__dirname, 'config.js');
    const configContent = readFileSync(configPath, 'utf-8');
    const match = configContent.match(/REPLICATE_API_TOKEN:\s*['"]([^'"]+)['"]/);
    if (match && match[1] && match[1] !== 'your_api_token_here') {
      return match[1];
    }
    throw new Error('API token not found or not set in config.js');
  } catch (error) {
    console.error('Error reading API token:', error.message);
    return null;
  }
}

const API_TOKEN = getApiToken();

if (!API_TOKEN) {
  console.error('⚠️  WARNING: API token not found. Please set REPLICATE_API_TOKEN in config.js');
}

// Proxy endpoint to get model version
app.get('/api/model/version', async (req, res) => {
  if (!API_TOKEN) {
    return res.status(500).json({ error: 'API token not configured' });
  }

  try {
    const modelId = req.query.model || 'recraft-ai/recraft-v3';
    const response = await fetch(`https://api.replicate.com/v1/models/${modelId}/versions`, {
      headers: {
        'Authorization': `Token ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: error.detail || response.statusText });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching model version:', error);
    res.status(500).json({ error: error.message });
  }
});

// Proxy endpoint to create prediction
app.post('/api/predictions', async (req, res) => {
  if (!API_TOKEN) {
    return res.status(500).json({ error: 'API token not configured' });
  }

  try {
    const { version, input } = req.body;

    if (!version || !input) {
      return res.status(400).json({ error: 'Missing version or input' });
    }

    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ version, input })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: error.detail || response.statusText });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error creating prediction:', error);
    res.status(500).json({ error: error.message });
  }
});

// Proxy endpoint to get prediction status
app.get('/api/predictions/:id', async (req, res) => {
  if (!API_TOKEN) {
    return res.status(500).json({ error: 'API token not configured' });
  }

  try {
    const { id } = req.params;
    const response = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: {
        'Authorization': `Token ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: error.detail || response.statusText });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching prediction:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on http://localhost:${PORT}`);
  console.log(`📝 Make sure your REPLICATE_API_TOKEN is set in config.js`);
});

