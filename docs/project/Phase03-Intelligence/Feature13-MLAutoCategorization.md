# Feature 13 - ML Auto-Categorization

**Estado**: ⏸️ Pendiente
**Prioridad**: Media
**Complejidad**: Media
**Tiempo Estimado**: 1 semana (5-7 días)
**ROI**: MEDIO (incrementa accuracy 15-20%)

---

## Objetivo

Mejorar auto-categorización usando ML personalizado entrenado con el histórico del usuario.

---

## Problem with Current Rule-Based System

**Limitations**:
- Static rules don't adapt to user behavior
- Can't handle context (amount + description + merchant + time)
- No learning from user corrections
- 70% accuracy ceiling

**ML Solution Benefits**:
- Learns unique user patterns
- Context-aware predictions
- Continuous improvement with feedback
- Target: 85-90% accuracy

---

## Stack Técnico

**Model**: Random Forest Classifier
- Fast training (<1 min)
- Interpretable (feature importance)
- Robust to imbalanced data
- Handles categorical + numerical features

**Alternative**: XGBoost (higher accuracy, slower)

**Features** (10 total):
```python
features = [
    'description_tfidf',      # TF-IDF vectorization of description (top 100 words)
    'amount_range',           # Binned amount (0-100, 100-500, 500+, etc.)
    'merchant_embedding',     # Merchant name embedding
    'day_of_week',           # 0-6
    'day_of_month',          # 1-31 (payday effects)
    'hour_of_day',           # 0-23 (morning/evening patterns)
    'is_weekend',            # Boolean
    'prev_category_freq',    # Historical frequency of categories
    'avg_amount_in_cat',     # User's avg amount for similar transactions
    'time_since_last_similar' # Hours since last similar transaction
]
```

---

## Training Pipeline

```
1. Data Collection: Min 100 transactions per user
2. Feature Engineering: Extract 10 features
3. Train-Test Split: 80/20 stratified
4. Train Random Forest: 100 trees, max_depth=10
5. Cross-Validation: 5-fold
6. Evaluate: Accuracy, Precision, Recall per category
7. Deploy if accuracy > 80%
8. Weekly Retraining: Incorporate new transactions + feedback
```

---

## Backend Implementation

**Entity**: `MLModel`
```csharp
public class MLModel
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string ModelType { get; set; } // "RandomForest", "XGBoost"
    public string ModelPath { get; set; } // Path to serialized model
    public decimal Accuracy { get; set; }
    public int TrainingSamples { get; set; }
    public DateTime TrainedAt { get; set; }
    public DateTime? LastPredictionAt { get; set; }
    public int PredictionCount { get; set; }
}
```

**Service**: `MLCategorizationService`
```csharp
public class MLCategorizationService
{
    public async Task<CategoryPrediction> PredictCategoryAsync(Transaction tx)
    {
        var model = await _mlModelRepository.GetLatestByUserAsync(tx.UserId);
        
        if (model == null || model.Accuracy < 0.70m)
        {
            // Fall back to rule-based
            return await _categoryRuleEngine.SuggestCategoryAsync(tx);
        }
        
        // Extract features
        var features = await ExtractFeaturesAsync(tx);
        
        // Call Python ML service
        var prediction = await _pythonBridge.PredictAsync(
            modelPath: model.ModelPath,
            features: features);
        
        return new CategoryPrediction
        {
            CategoryId = prediction.CategoryId,
            Confidence = prediction.Confidence,
            Method = "ML"
        };
    }
    
    public async Task RetrainModelAsync(Guid userId)
    {
        var transactions = await _transactionRepository
            .GetByUserAsync(userId, minCount: 100);
        
        if (transactions.Count < 100)
        {
            throw new InsufficientDataException(
                "Need at least 100 transactions to train ML model");
        }
        
        // Call Python training service
        var result = await _pythonBridge.TrainAsync(
            userId: userId,
            transactions: transactions);
        
        if (result.Accuracy >= 0.80m)
        {
            await _mlModelRepository.AddAsync(new MLModel
            {
                UserId = userId,
                ModelType = "RandomForest",
                ModelPath = result.ModelPath,
                Accuracy = result.Accuracy,
                TrainingSamples = transactions.Count,
                TrainedAt = DateTime.UtcNow
            });
        }
    }
}
```

---

## Python ML Service

```python
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
import joblib

@app.post("/train/categorization")
async def train_model(request: TrainingRequest):
    # 1. Prepare features
    X = extract_features(request.transactions)
    y = [t.category_id for t in request.transactions]
    
    # 2. Train-test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42)
    
    # 3. Train Random Forest
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        min_samples_split=5,
        random_state=42
    )
    model.fit(X_train, y_train)
    
    # 4. Evaluate
    accuracy = model.score(X_test, y_test)
    
    # 5. Save model
    model_path = f"models/user_{request.user_id}_rf.pkl"
    joblib.dump(model, model_path)
    
    return {
        "model_path": model_path,
        "accuracy": float(accuracy),
        "training_samples": len(X_train)
    }

@app.post("/predict/categorization")
async def predict_category(request: PredictionRequest):
    model = joblib.load(request.model_path)
    features = extract_features([request.transaction])
    
    prediction = model.predict(features)[0]
    probabilities = model.predict_proba(features)[0]
    confidence = max(probabilities)
    
    return {
        "category_id": prediction,
        "confidence": float(confidence)
    }
```

---

## Frontend

**Widget**: `MLModelStatus.jsx`
```jsx
function MLModelStatus() {
  const [model, setModel] = useState(null);

  return (
    <div className="ml-status-widget">
      <h3>🤖 ML Auto-Categorization</h3>
      
      {model ? (
        <div>
          <p className="text-sm">Model Accuracy: {(model.accuracy * 100).toFixed(1)}%</p>
          <p className="text-xs text-gray-500">
            Trained on {model.trainingSamples} transactions
          </p>
          <p className="text-xs text-gray-500">
            Last trained: {formatDate(model.trainedAt)}
          </p>
          <button onClick={retrainModel} className="btn-sm mt-2">
            Retrain Model
          </button>
        </div>
      ) : (
        <div>
          <p className="text-sm">No ML model trained yet</p>
          <p className="text-xs text-gray-500">
            Need 100+ transactions to train
          </p>
          <button onClick={trainModel} className="btn-sm mt-2" disabled={txCount < 100}>
            Train Model
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## Performance Targets

- Training Time: <60s for 1000 transactions
- Prediction Time: <100ms
- Accuracy: >80% (vs 70% rule-based)
- Retraining: Weekly automatic

---

**Dependencies**: Historical transaction data (min 100), Python sklearn
**Next Step**: Implement feature extraction, train initial model
