// Main Application Logic
import { generateImage, downloadImageAsBlob } from './api.js';
import { config } from './config.js';

// Application state
const appState = {
  sourceImages: [],
  generatedImages: [],
  currentImage: null
};

// DOM Elements
const elements = {
  uploadZone: null,
  imageGallery: null,
  generatedGallery: null,
  randomGenBtn: null,
  manualGenBtn: null,
  batchGenBtn: null,
  modal: null,
  modalContent: null,
  closeModal: null
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initializeElements();
  setupEventListeners();
  loadSourceImages();
  loadGeneratedImages();
});

function initializeElements() {
  elements.uploadZone = document.getElementById('upload-zone');
  elements.imageGallery = document.getElementById('image-gallery');
  elements.generatedGallery = document.getElementById('generated-gallery');
  elements.randomGenBtn = document.getElementById('random-generate-btn');
  elements.manualGenBtn = document.getElementById('manual-generate-btn');
  elements.batchGenBtn = document.getElementById('batch-generate-btn');
  elements.modal = document.getElementById('modal');
  elements.modalContent = document.getElementById('modal-content');
  elements.closeModal = document.getElementById('close-modal');
}

function setupEventListeners() {
  // Drag and drop
  if (elements.uploadZone) {
    elements.uploadZone.addEventListener('dragover', handleDragOver);
    elements.uploadZone.addEventListener('drop', handleDrop);
    elements.uploadZone.addEventListener('click', () => {
      document.getElementById('file-input').click();
    });
  }

  document.getElementById('file-input')?.addEventListener('change', handleFileSelect);

  // Generation buttons
  elements.randomGenBtn?.addEventListener('click', openRandomGenerationModal);
  elements.manualGenBtn?.addEventListener('click', openManualGenerationModal);
  elements.batchGenBtn?.addEventListener('click', openBatchGenerationModal);

  // Modal close
  elements.closeModal?.addEventListener('click', closeModal);
  elements.modal?.addEventListener('click', (e) => {
    if (e.target === elements.modal) {
      closeModal();
    }
  });
}

// Image Loading Functions
async function loadSourceImages() {
  try {
    // Try to load images from Images directory
    // Note: In development, Vite will serve files from the parent directory
    const response = await fetch('/Images/');
    if (!response.ok) {
      console.log('Could not load images from server. Use drag-and-drop to upload images.');
      return;
    }
    // This would require server-side directory listing, so we'll rely on drag-and-drop
  } catch (error) {
    console.log('Use drag-and-drop to upload source images.');
  }
}

async function loadGeneratedImages() {
  // Load from local storage or try to access outputs directory
  const saved = localStorage.getItem('generatedImages');
  if (saved) {
    appState.generatedImages = JSON.parse(saved);
    renderGeneratedGallery();
  }
}

// Drag and Drop Handlers
function handleDragOver(e) {
  e.preventDefault();
  elements.uploadZone.classList.add('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  elements.uploadZone.classList.remove('drag-over');
  
  const files = Array.from(e.dataTransfer.files).filter(file => 
    file.type.startsWith('image/')
  );
  
  handleFiles(files);
}

function handleFileSelect(e) {
  const files = Array.from(e.target.files);
  handleFiles(files);
}

function handleFiles(files) {
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = {
        name: file.name,
        url: e.target.result,
        file: file
      };
      appState.sourceImages.push(imageData);
      renderSourceGallery();
    };
    reader.readAsDataURL(file);
  });
}

// Gallery Rendering
function renderSourceGallery() {
  if (!elements.imageGallery) return;
  
  elements.imageGallery.innerHTML = appState.sourceImages.map((img, index) => `
    <div class="gallery-item" data-index="${index}">
      <img src="${img.url}" alt="${img.name}" />
      <div class="gallery-item-overlay">
        <span>${img.name}</span>
      </div>
    </div>
  `).join('');

  // Add click handlers
  elements.imageGallery.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const index = parseInt(item.dataset.index);
      appState.currentImage = appState.sourceImages[index];
      item.classList.toggle('selected');
      elements.imageGallery.querySelectorAll('.gallery-item').forEach(i => {
        if (i !== item) i.classList.remove('selected');
      });
    });
  });
}

function renderGeneratedGallery() {
  if (!elements.generatedGallery) return;
  
  if (appState.generatedImages.length === 0) {
    elements.generatedGallery.innerHTML = '<p class="empty-state">No generated images yet. Start generating!</p>';
    return;
  }

  elements.generatedGallery.innerHTML = appState.generatedImages.map((img, index) => `
    <div class="gallery-item generated-item">
      <img src="${img.url}" alt="Generated image ${index + 1}" />
      <div class="gallery-item-overlay">
        <button class="btn-download" onclick="downloadGeneratedImage(${index})">Download</button>
        <button class="btn-view" onclick="viewImageDetails(${index})">Details</button>
      </div>
      <div class="gallery-item-info">
        <p class="prompt-preview">${truncate(img.prompt, 50)}</p>
      </div>
    </div>
  `).join('');
}

// Generation Functions
function openRandomGenerationModal() {
  const content = `
    <h2>Random Generation</h2>
    <div class="form-group">
      <label for="num-images">Number of Images:</label>
      <input type="number" id="num-images" min="1" max="10" value="3" class="form-control" />
    </div>
    <div class="form-group">
      <label for="base-prompt">Base Prompt (optional):</label>
      <textarea id="base-prompt" class="form-control" rows="2" placeholder="e.g., logo design"></textarea>
    </div>
    <div class="modal-actions">
      <button class="btn btn-primary" onclick="startRandomGeneration()">Generate</button>
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
    </div>
  `;
  showModal(content);
}

function openManualGenerationModal() {
  const content = `
    <h2>Manual Generation</h2>
    <div class="form-group">
      <label for="manual-prompt">Prompt:</label>
      <textarea id="manual-prompt" class="form-control" rows="3" placeholder="Describe the image you want to generate..."></textarea>
    </div>
    <div class="form-group">
      <label for="manual-size">Size:</label>
      <select id="manual-size" class="form-control">
        ${config.SIZE_OPTIONS.map(size => `<option value="${size}" ${size === config.DEFAULT_SIZE ? 'selected' : ''}>${size}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label for="manual-seed">Seed (optional, leave blank for random):</label>
      <input type="number" id="manual-seed" class="form-control" placeholder="e.g., 42" />
    </div>
    <div class="modal-actions">
      <button class="btn btn-primary" onclick="startManualGeneration()">Generate</button>
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
    </div>
  `;
  showModal(content);
}

function openBatchGenerationModal() {
  const content = `
    <h2>Batch Generation</h2>
    <div class="form-group">
      <label for="batch-prompts">Prompts (one per line):</label>
      <textarea id="batch-prompts" class="form-control" rows="5" placeholder="Enter prompts, one per line..."></textarea>
    </div>
    <div class="form-group">
      <label for="batch-size">Size:</label>
      <select id="batch-size" class="form-control">
        ${config.SIZE_OPTIONS.map(size => `<option value="${size}" ${size === config.DEFAULT_SIZE ? 'selected' : ''}>${size}</option>`).join('')}
      </select>
    </div>
    <div class="modal-actions">
      <button class="btn btn-primary" onclick="startBatchGeneration()">Generate All</button>
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
    </div>
  `;
  showModal(content);
}

// Make functions globally accessible for onclick handlers
window.startRandomGeneration = async function() {
  const numImages = parseInt(document.getElementById('num-images').value) || 3;
  const basePrompt = document.getElementById('base-prompt').value.trim();
  
  closeModal();
  showProgress(`Generating ${numImages} random variation(s)...`);

  for (let i = 0; i < numImages; i++) {
    const stylePrompt = config.STYLE_PROMPTS[Math.floor(Math.random() * config.STYLE_PROMPTS.length)];
    const prompt = basePrompt ? `${basePrompt}, ${stylePrompt}` : stylePrompt;
    const size = config.SIZE_OPTIONS[Math.floor(Math.random() * config.SIZE_OPTIONS.length)];
    const seed = Math.floor(Math.random() * 1000000);

    try {
      updateProgress(`[${i + 1}/${numImages}] Generating: ${truncate(prompt, 50)}...`);
      const result = await generateImage(prompt, size, seed, updateProgress);
      
      appState.generatedImages.unshift({
        url: result.url,
        prompt: result.prompt,
        size: result.size,
        seed: result.seed,
        timestamp: new Date().toISOString()
      });
      
      localStorage.setItem('generatedImages', JSON.stringify(appState.generatedImages));
      renderGeneratedGallery();
    } catch (error) {
      showError(`Failed to generate image ${i + 1}: ${error.message}`);
    }
  }

  hideProgress();
  showSuccess(`Successfully generated ${numImages} image(s)!`);
};

window.startManualGeneration = async function() {
  const prompt = document.getElementById('manual-prompt').value.trim();
  if (!prompt) {
    showError('Please enter a prompt');
    return;
  }

  const size = document.getElementById('manual-size').value;
  const seedInput = document.getElementById('manual-seed').value.trim();
  const seed = seedInput ? parseInt(seedInput) : null;

  closeModal();
  showProgress('Generating image...');

  try {
    const result = await generateImage(prompt, size, seed, updateProgress);
    
    appState.generatedImages.unshift({
      url: result.url,
      prompt: result.prompt,
      size: result.size,
      seed: result.seed,
      timestamp: new Date().toISOString()
    });
    
    localStorage.setItem('generatedImages', JSON.stringify(appState.generatedImages));
    renderGeneratedGallery();
    hideProgress();
    showSuccess('Image generated successfully!');
  } catch (error) {
    hideProgress();
    showError(`Generation failed: ${error.message}`);
  }
};

window.startBatchGeneration = async function() {
  const promptsText = document.getElementById('batch-prompts').value.trim();
  if (!promptsText) {
    showError('Please enter at least one prompt');
    return;
  }

  const prompts = promptsText.split('\n').filter(p => p.trim()).map(p => p.trim());
  const size = document.getElementById('batch-size').value;

  closeModal();
  showProgress(`Generating ${prompts.length} image(s)...`);

  let successCount = 0;
  for (let i = 0; i < prompts.length; i++) {
    try {
      updateProgress(`[${i + 1}/${prompts.length}] ${truncate(prompts[i], 50)}...`);
      const result = await generateImage(prompts[i], size, null, updateProgress);
      
      appState.generatedImages.unshift({
        url: result.url,
        prompt: result.prompt,
        size: result.size,
        seed: result.seed,
        timestamp: new Date().toISOString()
      });
      successCount++;
      
      localStorage.setItem('generatedImages', JSON.stringify(appState.generatedImages));
      renderGeneratedGallery();
    } catch (error) {
      console.error(`Failed to generate image ${i + 1}:`, error);
    }
  }

  hideProgress();
  showSuccess(`Batch complete! Generated ${successCount}/${prompts.length} image(s).`);
};

// Utility Functions
function showModal(content) {
  if (elements.modalContent) {
    elements.modalContent.innerHTML = content;
    elements.modal.classList.add('active');
  }
}

function closeModal() {
  if (elements.modal) {
    elements.modal.classList.remove('active');
  }
}

function showProgress(message) {
  let progressEl = document.getElementById('progress-bar');
  if (!progressEl) {
    progressEl = document.createElement('div');
    progressEl.id = 'progress-bar';
    progressEl.className = 'progress-bar';
    document.body.appendChild(progressEl);
  }
  progressEl.innerHTML = `<div class="progress-message">${message}</div><div class="progress-spinner"></div>`;
  progressEl.style.display = 'flex';
}

function updateProgress(message) {
  const progressEl = document.getElementById('progress-bar');
  if (progressEl) {
    const messageEl = progressEl.querySelector('.progress-message');
    if (messageEl) {
      messageEl.textContent = message;
    }
  }
}

function hideProgress() {
  const progressEl = document.getElementById('progress-bar');
  if (progressEl) {
    progressEl.style.display = 'none';
  }
}

function showError(message) {
  showNotification(message, 'error');
}

function showSuccess(message) {
  showNotification(message, 'success');
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add('show');
  }, 10);

  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function truncate(str, length) {
  return str.length > length ? str.substring(0, length) + '...' : str;
}

window.downloadGeneratedImage = async function(index) {
  const img = appState.generatedImages[index];
  try {
    const blob = await downloadImageAsBlob(img.url);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `generated_${index + 1}_${Date.now()}.webp`;
    a.click();
    URL.revokeObjectURL(url);
    showSuccess('Image downloaded!');
  } catch (error) {
    showError(`Failed to download: ${error.message}`);
  }
};

window.viewImageDetails = function(index) {
  const img = appState.generatedImages[index];
  const content = `
    <h2>Image Details</h2>
    <div class="image-details">
      <img src="${img.url}" alt="Generated image" style="max-width: 100%; margin-bottom: 1rem;" />
      <div class="detail-item">
        <strong>Prompt:</strong>
        <p>${img.prompt}</p>
      </div>
      <div class="detail-item">
        <strong>Size:</strong>
        <p>${img.size}</p>
      </div>
      <div class="detail-item">
        <strong>Seed:</strong>
        <p>${img.seed || 'Random'}</p>
      </div>
      <div class="detail-item">
        <strong>Timestamp:</strong>
        <p>${new Date(img.timestamp).toLocaleString()}</p>
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-primary" onclick="downloadGeneratedImage(${index}); closeModal();">Download</button>
      <button class="btn btn-secondary" onclick="closeModal()">Close</button>
    </div>
  `;
  showModal(content);
};

