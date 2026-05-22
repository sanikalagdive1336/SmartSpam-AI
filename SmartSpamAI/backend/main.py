"""
SmartSpam AI - FastAPI Backend API

This file creates a RESTful API using FastAPI to serve the trained Machine Learning model.
It loads the model and vectorizer, and provides an endpoint for predicting spam or ham.
"""

import os
import string
import joblib
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# Resolve absolute paths to the model files relative to this main.py file's directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "spam_model.pkl")
VECTORIZER_PATH = os.path.join(BASE_DIR, "vectorizer.pkl")

# Common English stopwords list to keep the setup dependency-free and lightweight
STOPWORDS = set([
    "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours", 
    "yourself", "yourselves", "he", "him", "his", "himself", "she", "her", "hers", 
    "herself", "it", "its", "itself", "they", "them", "their", "theirs", "themselves", 
    "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is", "are", 
    "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does", 
    "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until", 
    "while", "of", "at", "by", "for", "with", "about", "against", "between", "into", 
    "through", "during", "before", "after", "above", "below", "to", "from", "up", "down", 
    "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here", 
    "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", 
    "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", 
    "than", "too", "very", "s", "t", "can", "will", "just", "don", "should", "now"
])

def preprocess_text(text):
    """
    Applies text preprocessing:
    1. Converts text to lowercase
    2. Removes punctuation
    3. Removes common English stopwords
    """
    if not isinstance(text, str):
        return ""
    
    # 1. Lowercase conversion
    text = text.lower()
    
    # 2. Punctuation removal
    text = text.translate(str.maketrans("", "", string.punctuation))
    
    # 3. Stopword removal
    words = text.split()
    filtered_words = [word for word in words if word not in STOPWORDS]
    
    return " ".join(filtered_words)

# Global dictionary to hold model instances
ml_models = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Debugging log for backend starting
    print("Backend started")
    
    # Load the ML models when the application starts
    try:
        if os.path.exists(MODEL_PATH) and os.path.exists(VECTORIZER_PATH):
            ml_models["model"] = joblib.load(MODEL_PATH)
            print("Model loaded")
            ml_models["vectorizer"] = joblib.load(VECTORIZER_PATH)
            print("Vectorizer loaded")
        else:
            print(f"Error: Model files not found at {MODEL_PATH} or {VECTORIZER_PATH}")
            print("Please run train_model.py to train and save the models first.")
    except Exception as e:
        print(f"Error loading models: {str(e)}")
        
    yield
    # Clean up resources when the application shuts down
    ml_models.clear()

# Initialize FastAPI application
app = FastAPI(
    title="SmartSpam AI API",
    description="API for NLP-based spam detection system",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Setup
# Explicitly allowing frontend origins and methods to avoid any CORS issues
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic BaseModel for request validation
class PredictionRequest(BaseModel):
    text: str

@app.get("/")
def read_root():
    """
    Root endpoint to check if the API is successfully running.
    """
    return {"message": "SmartSpam AI Backend Running"}

@app.post("/predict")
def predict_spam(request: PredictionRequest):
    """
    Endpoint to predict whether a given text is spam or ham.
    Expects a JSON payload with a 'text' field.
    """
    # Debug log for request received
    print(f"Request received: {request.text}")
    
    # Check if the models were loaded successfully during startup
    if "model" not in ml_models or "vectorizer" not in ml_models:
        err_msg = "Model files are not loaded. Please ensure train_model.py has been executed."
        print(f"Error: {err_msg}")
        raise HTTPException(
            status_code=503, 
            detail=err_msg
        )

    try:
        model = ml_models["model"]
        vectorizer = ml_models["vectorizer"]
        
        # Apply the exact same text preprocessing logic to the input text
        clean_text = preprocess_text(request.text)
        
        # Use the loaded TF-IDF vectorizer to transform preprocessed input text
        vectorized_text = vectorizer.transform([clean_text])
        
        # Use the trained ML model to predict: spam or ham
        prediction_label = model.predict(vectorized_text)[0]
        
        # Calculate confidence by taking the highest probability and converting to percentage
        probabilities = model.predict_proba(vectorized_text)[0]
        confidence = round(max(probabilities) * 100, 2)
        
        # Debug log for prediction generated
        print(f"Prediction generated: {prediction_label} with confidence {confidence}%")
        
        # Return the final JSON response
        return {
            "prediction": prediction_label,
            "confidence": confidence
        }
        
    except Exception as e:
        err_msg = f"Prediction error: {str(e)}"
        print(f"Error: {err_msg}")
        raise HTTPException(status_code=500, detail=err_msg)

