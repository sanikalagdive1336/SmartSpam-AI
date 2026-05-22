# SmartSpam AI - VS Code Live Server Setup & Connectivity Guide

This guide will help you resolve the **404 File Not Found** error when launching the frontend via VS Code's Live Server extension. It outlines the correct workspace configuration, folder structure, backend execution steps, and common troubleshooting tips.

---

## 1. The Root Cause of the "404 File Not Found" Error

When you open the entire `SmartSpamAI` folder in VS Code, Live Server sets the **root URL (`/`)** to the `SmartSpamAI` directory. This generates a URL path like:
`http://127.0.0.1:5500/frontend/index.html` (or `http://127.0.0.1:5500/SmartSpamAI/frontend/index.html`)

If the Live Server root does not match your project folder hierarchy, assets linked with relative paths (like `href="style.css"` or `src="script.js"`) may fail to load, or you may receive a direct `404 Not Found` error.

### The Solution:
Open **ONLY** the `frontend` directory in VS Code. This makes the `frontend` folder the server's root (`/`), pointing `http://127.0.0.1:5500/index.html` directly to your main HTML file.

---

## 2. Step-by-Step Guide to Re-open the Project

Follow these exact steps to reset your VS Code workspace:

### Step A: Stop the Active Live Server Instance
1. Look at the bottom status bar in VS Code (on the bottom right).
2. You will see a button labeled **"Port: 5500"** (indicating Live Server is running).
3. Click **"Port: 5500"** to stop the server. The button text will change back to **"Go Live"**.

### Step B: Open the Correct Folder in VS Code
1. In the VS Code top menu, click **File** -> **Open Folder...** (or press `Ctrl + K, Ctrl + O`).
2. Navigate to your project directory:
   `c:\Users\acer\OneDrive\Desktop\New folder\secureinbox\SmartSpamAI`
3. Select the **`frontend`** directory and click **Select Folder**.
4. VS Code will reload, showing only the frontend assets in the Explorer sidebar.

### Step C: Verify Frontend Structure
Confirm your Explorer sidebar shows exactly these files inside the opened directory:
```
frontend/
├── index.html
├── style.css
└── script.js
```

### Step D: Confirm Relative Path Connections
Open `index.html` and ensure the CSS and JS references are exactly as follows:
* **CSS Link (in the `<head>` tag):**
  ```html
  <link rel="stylesheet" href="style.css" />
  ```
* **JavaScript Script Tag (near the end of `<body>` tag):**
  ```html
  <script src="script.js"></script>
  ```

### Step E: Launch Live Server
1. In the VS Code Explorer sidebar, right-click `index.html`.
2. Select **"Open with Live Server"** from the context menu (or press `Alt + L, Alt + O`).
3. Your browser will open the webpage at:
   `http://127.0.0.1:5500/index.html` (or `http://localhost:5500/index.html`)

---

## 3. Verifying the Frontend Loads Correctly

Once the page opens at the correct URL:
1. **Verify CSS Loads:** The page should display a premium dark cyber-security theme with red accent glow effects, glassmorphic containers, and custom typography (Sora / DM Sans).
2. **Verify JavaScript Loads:** You should see a red particle background animation flowing and connecting with lines inside the hero section.
3. **Verify Animations & Buttons:** Hover over cards to check transition effects. The **"AI SCAN & ANALYZE"** button should remain disabled until you type text into the input field.

---

## 4. Starting and Testing the Backend Separately

The frontend requires the FastAPI backend to run on port `8000` to process text scans.

### Step A: Start the FastAPI Server
1. Open a new Terminal (in VS Code or your preferred command line).
2. Navigate to the backend directory:
   ```powershell
   cd "c:\Users\acer\OneDrive\Desktop\New folder\secureinbox\SmartSpamAI\backend"
   ```
3. Start the FastAPI server using `uvicorn`:
   ```powershell
   uvicorn main:app --reload
   ```
4. You should see logs indicating the server is running:
   ```
   INFO:     Started server process [PID]
   INFO:     Waiting for application startup.
   Backend started
   Model loaded
   Vectorizer loaded
   INFO:     Application startup complete.
   INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
   ```

### Step B: Verify Backend Is Active
To test if the backend server is running and inspect the API endpoints:
1. Open your browser and navigate to:
   `http://127.0.0.1:8000/docs`
2. This will display the Interactive Swagger UI.
3. You can click on the `POST /predict` endpoint, click **Try it out**, enter test JSON data, and verify that the API returns the prediction successfully.

---

## 5. How Frontend and Backend Communicate

The two systems interact using HTTP REST requests:
1. **Request Payload:** The frontend sends a POST request to `http://127.0.0.1:8000/predict` with headers `Content-Type: application/json` and body containing the serialized text:
   ```json
   {
     "text": "Congratulations! Your SBI reward is pending. Click now."
   }
   ```
2. **CORS Headers:** Since the frontend runs on port `5500` and the backend runs on port `8000`, the browser triggers a CORS preflight request. The backend's `CORSMiddleware` replies with `Access-Control-Allow-Origin: *`, permitting the browser to receive the response.
3. **Response Payload:** The backend processes the input, uses the Naive Bayes model and TF-IDF vectorizer to make predictions, and returns:
   ```json
   {
     "prediction": "spam",
     "confidence": 77.66
   }
   ```

---

## 6. Troubleshooting Common Issues

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **404 File Not Found** | The wrong root folder was opened in VS Code or the URL contains incorrect nested path subfolders. | Close VS Code, reopen it, open the **`frontend`** directory specifically as the root folder, and select "Open with Live Server". |
| **Live Server Not Opening** | The VS Code extension might be crashed or conflicts with another server. | Click the Live Server port number on the status bar to stop it, restart VS Code, and relaunch. |
| **CSS or script.js Not Loading** | Incorrect relative paths or folder structure mismatch. | Verify `href="style.css"` and `src="script.js"` are exactly relative. Check the Developer Console (`F12`) under the network tab to see where the files are being requested. |
| **Backend Connection Issues** | FastAPI backend server is not running, bound to wrong port/host, or blocked by firewall. | Make sure `uvicorn main:app --reload` is running in your terminal and binding to port `8000`. Test access to `http://127.0.0.1:8000/` in your browser. |
| **CORS Blocked Error** | Missing CORS configuration on backend. | Verify `CORSMiddleware` is configured in `main.py` and allows `allow_origins=["*"]`. |
| **Model files missing error** | `spam_model.pkl` or `vectorizer.pkl` not found on backend. | Ensure you run `python train_model.py` in the `backend` folder first to train and generate the pickle files. |
