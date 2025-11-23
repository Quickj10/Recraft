// Replicate API Client (using proxy server to avoid CORS)
import { config } from './config.js';

const PROXY_API_URL = 'http://localhost:3000/api';
const REPLICATE_API_URL = 'https://api.replicate.com/v1/predictions';

/**
 * Generate an image using Recraft V3 model via Replicate API
 * @param {string} prompt - Text prompt describing the image to generate
 * @param {string} size - Image size in format "WIDTHxHEIGHT" (default: "1365x1024")
 * @param {number|null} seed - Random seed for reproducibility (optional)
 * @param {function} progressCallback - Callback function for progress updates
 * @returns {Promise<Object>} Generated image data with URL and metadata
 */
export async function generateImage(prompt, size = config.DEFAULT_SIZE, seed = null, progressCallback = null) {
  if (progressCallback) {
    progressCallback('Starting generation...');
  }

  // Prepare input parameters
  const inputParams = {
    prompt: prompt,
    size: size
  };

  if (seed !== null) {
    inputParams.seed = seed;
  }

  try {
    if (progressCallback) {
      progressCallback('Getting model version...');
    }

    // Get the latest version of the model first via proxy
    const modelResponse = await fetch(`${PROXY_API_URL}/model/version?model=${config.MODEL_ID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!modelResponse.ok) {
      const errorData = await modelResponse.json().catch(() => ({}));
      throw new Error(`Failed to get model version: ${errorData.error || modelResponse.statusText}`);
    }

    const modelData = await modelResponse.json();
    if (!modelData.results || modelData.results.length === 0) {
      throw new Error('No model versions found');
    }

    // Use the latest version (first in results)
    const versionId = modelData.results[0].id;

    if (progressCallback) {
      progressCallback('Creating prediction...');
    }

    // Create prediction with version ID via proxy
    const createResponse = await fetch(`${PROXY_API_URL}/predictions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: versionId,
        input: inputParams
      })
    });

    if (!createResponse.ok) {
      const error = await createResponse.json();
      throw new Error(error.error || error.detail || `API Error: ${createResponse.status}`);
    }

    const prediction = await createResponse.json();

    if (progressCallback) {
      progressCallback('Waiting for generation to complete...');
    }

    // Poll for completion
    let result = prediction;
    while (result.status === 'starting' || result.status === 'processing') {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second

      const statusResponse = await fetch(`${PROXY_API_URL}/predictions/${result.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!statusResponse.ok) {
        throw new Error(`Failed to check status: ${statusResponse.status}`);
      }

      result = await statusResponse.json();

      if (result.status === 'failed') {
        throw new Error(result.error || 'Generation failed');
      }

      if (progressCallback && result.status === 'processing') {
        progressCallback('Processing...');
      }
    }

    if (progressCallback) {
      progressCallback('Downloading generated image...');
    }

    // Get the output URL
    let imageUrl;
    if (result.output && Array.isArray(result.output) && result.output.length > 0) {
      imageUrl = result.output[0];
    } else if (typeof result.output === 'string') {
      imageUrl = result.output;
    } else {
      throw new Error('No output URL found in response');
    }

    if (progressCallback) {
      progressCallback('✓ Generation complete!');
    }

    return {
      url: imageUrl,
      prompt: prompt,
      size: size,
      seed: seed,
      predictionId: result.id
    };

  } catch (error) {
    const errorMsg = `Error generating image: ${error.message}`;
    if (progressCallback) {
      progressCallback(errorMsg);
    }
    throw new Error(errorMsg);
  }
}

/**
 * Download an image from a URL and return as blob
 * @param {string} url - Image URL
 * @returns {Promise<Blob>} Image blob
 */
export async function downloadImageAsBlob(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status}`);
  }
  return await response.blob();
}

