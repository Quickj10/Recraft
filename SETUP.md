# Setup Instructions

## 1. Create `.env` File

Create a file named `.env` in the same directory as `recraft_generator.ipynb` with the following content:

```
REPLICATE_API_TOKEN=your_api_token_here
```

Replace `your_api_token_here` with your actual Replicate API token.

**To get your API token:**
1. Go to https://replicate.com/account/api-tokens
2. Click "Create token"
3. Copy the token and paste it in your `.env` file

## 2. Set Up Billing

Before using the API, you need to set up billing:
1. Go to https://replicate.com/account/billing
2. Click "Set up billing"
3. Add your payment method (credit card)

The Recraft V3 model costs approximately $0.04 per generated image.

## 3. Install Dependencies

Install the required Python packages:

```bash
pip install -r requirements.txt
```

Or install individually:

```bash
pip install replicate python-dotenv pillow ipython ipywidgets requests
```

## 4. Run the Notebook

1. Open `recraft_generator.ipynb` in Jupyter Notebook or JupyterLab
2. Run all cells in order
3. Start generating images!

## Notes

- The `.env` file is already in `.gitignore` to keep your API token secure
- Generated images will be saved in the `outputs/` folder
- Each generated image includes a JSON metadata file with prompt, seed, and other parameters

