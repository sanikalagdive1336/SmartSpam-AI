"""
SmartSpam AI - Model Training Script

This script trains a Machine Learning model to detect spam messages.
It uses custom NLP preprocessing, TF-IDF for text vectorization, and a Multinomial Naive Bayes classifier.
"""

import os
import string
import pandas as pd
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import accuracy_score, precision_score, recall_score

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

def train_spam_model():
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    
    # Check dataset paths in order of preference
    paths_to_check = [
        os.path.join(BASE_DIR, "..", "dataset", "spam_dataset.csv"),
        os.path.join(BASE_DIR, "..", "dataset", "indian_sms_spam_ham.csv")
    ]
    
    dataset_path = None
    for path in paths_to_check:
        if os.path.exists(path):
            dataset_path = path
            break
            
    if not dataset_path:
        print("Error: Dataset file not found. Checked paths:")
        for path in paths_to_check:
            print(f" - {path}")
        return

    # 1. Load dataset using pandas
    try:
        print(f"Loading dataset from {dataset_path}...")
        df = pd.read_csv(dataset_path)
    except Exception as e:
        print(f"Error reading dataset: {e}")
        return

    # Verify dataset structure
    if 'text' not in df.columns or 'label' not in df.columns:
        print("Error: Dataset must contain 'text' and 'label' columns.")
        return
        
    print(f"Dataset Size: {len(df)} total messages loaded.")

    # Apply text preprocessing (lowercase, punctuation, stopword removal)
    print("Preprocessing text data (lowercase, punctuation, stopwords)...")
    df['clean_text'] = df['text'].apply(preprocess_text)

    # 2. Separate features (text) and labels
    X = df['clean_text']
    y = df['label']
    
    # Verify labels
    print(f"Label Distribution:\n{y.value_counts().to_string()}")

    # 3. Use TF-IDF vectorization for text preprocessing
    print("Vectorizing preprocessed text using TF-IDF...")
    vectorizer = TfidfVectorizer()
    X_vectorized = vectorizer.fit_transform(X)

    # 4. Split dataset into training and testing sets (80% train, 20% test)
    print("Splitting dataset into training and testing sets...")
    X_train, X_test, y_train, y_test = train_test_split(
        X_vectorized, y, test_size=0.2, random_state=42
    )

    # 5. Train a Multinomial Naive Bayes classifier
    print("Training Multinomial Naive Bayes model...")
    model = MultinomialNB()
    model.fit(X_train, y_train)

    # 6. Predict on test data
    print("Evaluating model...")
    y_pred = model.predict(X_test)

    # 7. Calculate and print metrics
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, pos_label='spam')
    recall = recall_score(y_test, y_pred, pos_label='spam')

    # 8. Save trained model using joblib
    model_filename = os.path.join(BASE_DIR, "spam_model.pkl")
    joblib.dump(model, model_filename)
    print(f"Model saved to {model_filename}")

    # 9. Save TF-IDF vectorizer using joblib
    vectorizer_filename = os.path.join(BASE_DIR, "vectorizer.pkl")
    joblib.dump(vectorizer, vectorizer_filename)
    print(f"Vectorizer saved to {vectorizer_filename}")

    # 10. Print final metrics and success message
    print(f"Accuracy:  {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall:    {recall:.4f}")
    print("Model saved successfully")

if __name__ == "__main__":
    train_spam_model()

