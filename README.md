# 🛡️ SmartSpam AI - Intelligent Spam & Scam Detection Portal

**SmartSpam AI** (SecureInbox) is a high-performance, recruiter-ready cyber intelligence dashboard designed to scan and classify incoming text messages (SMS, emails, chats) for phishing attempts, lottery scams, and spam.

It is built with a lightweight, production-grade **FastAPI** backend serving a real **Scikit-learn** Machine Learning pipeline, and a stunning, responsive frontend built with **HTML5**, **Vanilla CSS3 (cybersecurity-themed Glassmorphism)**, and **JavaScript**.

---

## 🚀 Key Features

* **Real Machine Learning Pipeline**: Fully trained on a 1000-message balanced dataset using TF-IDF Vectorization and a Multinomial Naive Bayes classifier.
* **Interactive Threat Terminal**: Simulated loading steps (`[1] Preprocessing`, `[2] Vectorizing`, `[3] Evaluating`) that walk the user through the NLP classification stages.
* **Main Risk Probability Index**: A colorful progress bar mapping overall spam risk (Green for low, Orange for medium, Red for high risk).
* **Suspicious Keyword Highlight Engine**: Automatically runs a risk scanner to highlight dangerous phishing and scam terms (e.g. *SBI*, *KYC*, *lottery*, *verify*) inside an analyzed text box.
* **Quick Test Templates**: One-click mock buttons (Phishing SMS, Lottery Scam, Bank SMS, Normal Chat) to test prediction capabilities instantly.
* **Prediction History Logs**: Persistent log table showing past scans, confidence scores, and timestamps (cached locally in browser `localStorage`).
* **Interactive Threat Reports**: A "Copy Analysis Report" action to generate clean markdown threat alerts to the system clipboard.
* **Dark Cybersecurity Aesthetics**: Modern neon red/cyan color palettes, cyber grids, particle link networks, and sleek hover effects.
* **Fully Responsive**: Pixel-perfect layout adjustments from mobile viewports to ultra-wide displays.

---

## 🛠️ Technology Stack

* **Backend**: FastAPI, Python 3.13, Uvicorn
* **Machine Learning**: Scikit-learn, Pandas, Joblib
* **Frontend**: HTML5, Vanilla CSS3 (Custom Grid, Flex, Animations, Glassmorphism), JavaScript (ES6+), Lucide Icons

---

## 📈 ML Model Performance

The Naive Bayes model trained on `spam_dataset.csv` delivers top-tier performance metrics:

* **Dataset Shape**: 1,000 text samples (500 Ham / 500 Spam)
* **Accuracy**: **99.50%**
* **Precision**: **99.07%**
* **Recall**: **100.00%**
* **Inference Speed**: Under 15ms

---

## 📂 Project Directory Structure

```bash
SmartSpamAI/
│
├── dataset/
│   ├── spam_dataset.csv            # 1,000-message training dataset
│   └── indian_sms_spam_ham.csv     # Source SMS dataset
│
├── backend/
│   ├── main.py                     # FastAPI server & inference endpoint
│   ├── train_model.py              # ML Preprocessing, training & evaluation
│   ├── spam_model.pkl              # Serialized Naive Bayes model
│   └── vectorizer.pkl              # Serialized TF-IDF Vectorizer
│
└── frontend/
    ├── index.html                  # Cyber terminal landing page
    ├── style.css                   # Custom stylesheets & animations
    └── script.js                   # Client-side API hooks, examples, logs
```

---

## 💻 Setup & Installation

### 1. Clone & Prepare virtual environment

Navigate to the `SmartSpamAI/backend` folder and set up a virtual environment:

```bash
# Create a virtual environment
python -m venv venv

# Activate virtual environment (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# Activate virtual environment (macOS/Linux)
source venv/bin/activate
```

### 2. Install dependencies

Install the required machine learning and web server packages:

```bash
pip install fastapi uvicorn scikit-learn pandas joblib pydantic
```

### 3. Train the model

Train the classifier on the custom preprocessed dataset and generate serialized assets:

```bash
python train_model.py
```

*This will print model performance metrics and output `spam_model.pkl` and `vectorizer.pkl`.*

### 4. Run the API server

Start the FastAPI uvicorn development server:

```bash
uvicorn main:app --reload
```

*The backend API will be available at `http://127.0.0.1:8000`.*

### 5. Launch the Web Portal

* Open `frontend/index.html` in your browser.
* For the best developer experience, open the `frontend` folder directly in VS Code and start the **Live Server** extension (running on `http://127.0.0.1:5500/index.html`).

---

## 🌐 Deployment Note

This project uses the free version of Render for backend deployment.
So, the very first prediction request may take around **30–50 seconds** because the backend server wakes up from sleep mode after inactivity.

Once the backend becomes active, all subsequent predictions respond much faster.

---

## 🧑‍💻 Author
Developed with 🛡️ by **Sanika**
