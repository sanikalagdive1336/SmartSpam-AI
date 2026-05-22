# SmartSpam AI - Machine Learning Pipeline Integration

We have successfully integrated a complete, real-world Machine Learning pipeline into the **SecureInbox** (`SmartSpamAI`) project. The pipeline preprocesses text data, trains a classifier, generates serialization models, and serves them via the FastAPI backend.

---

## 1. Machine Learning Pipeline Architecture

The pipeline consists of the following components:

1. **Raw Text Input**: The input SMS or email message.
2. **NLP Preprocessing**:
   * **Lowercase Conversion**: Standardizes text to avoid duplicate features due to case differences.
   * **Punctuation Removal**: Removes all special symbols (e.g., `!`, `?`, `.`, `@`) that do not contribute to classifying spam.
   * **Stopword Removal**: Eliminates common English filler words (e.g., `the`, `is`, `at`, `which`) that do not carry semantic classification weight, reducing model size and training noise.
3. **TF-IDF Vectorization**: Transforms the preprocessed text into numeric vectors.
4. **Multinomial Naive Bayes Model**: Classifies the vectorized text.
5. **Predictions & Confidence Score**: Outputs classification and confidence.

---

## 2. Model Training and Performance Evaluation

The training script `train_model.py` was executed successfully on the 1000-message dataset (`dataset/spam_dataset.csv`).

### Execution Output:
```
Loading dataset from ...\dataset\spam_dataset.csv...
Dataset Size: 1000 total messages loaded.
Preprocessing text data (lowercase, punctuation, stopwords)...
Label Distribution:
label
ham     500
spam    500
Vectorizing preprocessed text using TF-IDF...
Splitting dataset into training and testing sets...
Training Multinomial Naive Bayes model...
Evaluating model...
Model saved to ...\backend\spam_model.pkl
Vectorizer saved to ...\backend\vectorizer.pkl
Accuracy:  0.9950
Precision: 0.9907
Recall:    1.0000
Model saved successfully
```

### Key Metrics:
* **Accuracy (99.50%)**: The proportion of correctly classified messages out of all test messages.
* **Precision (99.07%)**: The ratio of true spam detections to all messages flagged as spam by the model.
* **Recall (100.00%)**: The ratio of successfully caught spam messages to the total number of actual spam messages in the test set.

---

## 3. Connecting to the FastAPI Backend

The FastAPI backend has been updated to integrate the same preprocessing function to ensure consistent features during prediction.

### Prediction Output Example:
Sending a POST request to `http://127.0.0.1:8000/predict` with text `"Congratulations! Your SBI reward is pending. Click now."` returns:
```json
{
  "prediction": "spam",
  "confidence": 97.88
}
```

### Deployment and Persistence:
* **Lightweight Footprint**: The model `spam_model.pkl` (45 KB) and vectorizer `vectorizer.pkl` (27 KB) are extremely small, keeping the deployment footprint well under **500MB**.
* **Joblib persistence**: The assets are serialized using `joblib` for quick startup loading in the FastAPI backend lifespan.
