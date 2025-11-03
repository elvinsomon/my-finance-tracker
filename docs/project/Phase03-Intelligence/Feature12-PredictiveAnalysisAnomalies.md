# Feature 12 - Predictive Analysis & Anomaly Detection

**Estado**: ⏸️ Pendiente
**Prioridad**: **MÁXIMA**
**Complejidad**: Alta
**Tiempo Estimado**: 2.5 semanas (14-16 días)
**ROI Esperado**: MUY ALTO

---

## Objetivo

Sistema de análisis predictivo y detección de anomalías para:
1. Predecir gastos futuros con alta precisión
2. Detectar patterns anómalos automáticamente
3. Generar insights proactivos automáticos
4. Prevenir budget overruns antes de que ocurran

---

## Sub-Features

### 12.1 Time Series Forecasting (1 semana)
Predicción de gastos mensuales usando CNN-LSTM hybrid model.

### 12.2 Anomaly Detection (1 semana)
Detección automática de transacciones anómalas con Isolation Forest.

### 12.3 Smart Insights Engine (3-4 días)
Generación automática de insights accionables usando LLM.

---

## 12.1 Time Series Forecasting

### Casos de Uso

**UC1: Predicción de Gastos Mensuales**
- **Input**: Historical spending últimos 12-24 meses
- **Output**: Proyección de gasto para próximo mes con confidence interval
- **Example**: "Vas a gastar aproximadamente RD$42,000-46,000 este mes (confidence: 85%)"

**UC2: Cashflow Forecasting**
- **Input**: Historical income + expenses + patterns estacionales
- **Output**: Proyección de balance a 3-6 meses
- **Example**: "En 3 meses tendrás RD$125,000 ± RD$8,000"

**UC3: Budget Overrun Alerts**
- **Input**: Current spending + historical pattern + días restantes
- **Output**: Probabilidad de superar budget + días para ajustar
- **Example**: "Estás al 80% del budget de Alimentación con 10 días restantes. Probabilidad 75% de superar límite"

**UC4: Savings Goal Projection**
- **Input**: Current savings rate + meta objetivo + gastos proyectados
- **Output**: Projected completion date con accuracy
- **Example**: "Al ritmo actual, alcanzarás tu meta en 8.5 meses (projected: Septiembre 2026)"

### Stack Técnico

**Model**: CNN-LSTM Hybrid
- **CNN Layer**: Extrae spatial patterns de series temporales
- **LSTM Layer**: Captura temporal dependencies y long-term trends
- **Framework**: TensorFlow o PyTorch
- **Training**: Local con datos del usuario

**Features Engineering**:
```python
features = [
    'monthly_avg_per_category',  # Last 12 months average
    'day_of_week_pattern',       # Mon-Sun spending patterns
    'week_of_month',             # First/Last week differences
    'payday_effect',             # Spike after payday
    'seasonal_trend',            # Seasonal decomposition
    'holiday_flags',             # Special dates (Christmas, etc.)
    'previous_month_trend',      # Momentum indicator
    'category_correlation'       # Cross-category patterns
]
```

**Training Pipeline**:
```
1. Data Collection: Load 12-24 months historical transactions
2. Data Cleaning: Remove outliers, fill missing dates
3. Feature Engineering: Calculate 8 core features
4. Train-Test Split: 80/20 temporal split
5. Model Training: CNN-LSTM with early stopping
6. Validation: Calculate MAPE, RMSE
7. Hyperparameter Tuning: Grid search
8. Model Storage: Save to disk (pickle/ONNX)
9. Scheduled Retraining: Weekly with new data
```

**Prediction Pipeline**:
```
1. Load trained model from storage
2. Prepare input features (latest 30 days)
3. Run inference (forward pass)
4. Generate prediction + confidence intervals
5. Store results in database
6. Trigger alerts if threshold exceeded
```

### Backend Implementation

**Entity: Prediction**
```csharp
public class Prediction
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid? CategoryId { get; set; } // Null = overall
    
    public PredictionType Type { get; set; } // Monthly, Quarterly, Annual
    public DateTime PredictionDate { get; set; }
    public DateTime TargetMonth { get; set; }
    
    public decimal PredictedAmount { get; set; }
    public decimal LowerBound { get; set; } // 95% confidence
    public decimal UpperBound { get; set; }
    public decimal ConfidenceScore { get; set; } // 0.0-1.0
    
    public string ModelVersion { get; set; }
    public string Features { get; set; } // JSON
    
    public DateTime CreatedAt { get; set; }
}

public enum PredictionType
{
    MonthlySpending,
    Cashflow,
    CategorySpending,
    SavingsGoal
}
```

**Service: PredictionService**
```csharp
public class PredictionService
{
    private readonly IPythonBridge _pythonBridge;
    private readonly ITransactionRepository _transactionRepository;
    
    public async Task<MonthlyPrediction> PredictMonthlySpendingAsync(
        Guid userId,
        int month,
        int year)
    {
        // 1. Load historical data
        var historicalData = await _transactionRepository
            .GetHistoricalSpendingAsync(userId, months: 24);
        
        // 2. Call Python ML service
        var prediction = await _pythonBridge.PredictAsync(
            model: "cnn_lstm_monthly",
            data: historicalData);
        
        // 3. Store prediction
        var predictionEntity = new Prediction
        {
            UserId = userId,
            Type = PredictionType.MonthlySpending,
            TargetMonth = new DateTime(year, month, 1),
            PredictedAmount = prediction.Amount,
            LowerBound = prediction.LowerBound,
            UpperBound = prediction.UpperBound,
            ConfidenceScore = prediction.Confidence,
            ModelVersion = prediction.ModelVersion
        };
        
        await _predictionRepository.AddAsync(predictionEntity);
        
        // 4. Check for alerts
        await CheckPredictionAlertsAsync(userId, predictionEntity);
        
        return MapToDto(predictionEntity);
    }
    
    private async Task CheckPredictionAlertsAsync(Guid userId, Prediction prediction)
    {
        // Check budget overrun risk
        var budget = await _budgetRepository.GetByMonthAsync(
            userId,
            prediction.TargetMonth);
        
        if (budget != null && prediction.PredictedAmount > budget.Amount * 1.1)
        {
            await _notificationService.SendAlertAsync(
                userId,
                $"Prediction: You're likely to exceed your budget by {prediction.PredictedAmount - budget.Amount:C}");
        }
    }
}
```

**Controller: PredictionsController**
```csharp
[ApiController]
[Route("api/predictions")]
public class PredictionsController : ControllerBase
{
    [HttpGet("monthly")]
    public async Task<IActionResult> GetMonthlyPrediction(
        [FromQuery] int month,
        [FromQuery] int year)
    {
        var userId = GetCurrentUserId();
        var prediction = await _predictionService
            .PredictMonthlySpendingAsync(userId, month, year);
        
        return Ok(prediction);
    }
    
    [HttpGet("cashflow")]
    public async Task<IActionResult> GetCashflowForecast(
        [FromQuery] int months = 3)
    {
        var userId = GetCurrentUserId();
        var forecast = await _predictionService
            .ForecastCashflowAsync(userId, months);
        
        return Ok(forecast);
    }
    
    [HttpPost("retrain")]
    public async Task<IActionResult> RetrainModel()
    {
        var userId = GetCurrentUserId();
        await _predictionService.RetrainModelAsync(userId);
        
        return Ok(new { message = "Model retraining started" });
    }
}
```

### Python ML Service

**FastAPI Service**: `ml_service.py`
```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import numpy as np
import pandas as pd
from tensorflow import keras
import joblib

app = FastAPI()

# Load pre-trained model
model = keras.models.load_model('models/cnn_lstm_monthly.h5')
scaler = joblib.load('models/scaler.pkl')

class PredictionRequest(BaseModel):
    user_id: str
    historical_data: list[dict]
    target_month: str

class PredictionResponse(BaseModel):
    amount: float
    lower_bound: float
    upper_bound: float
    confidence: float
    model_version: str

@app.post("/predict/monthly", response_model=PredictionResponse)
async def predict_monthly(request: PredictionRequest):
    try:
        # 1. Prepare features
        df = pd.DataFrame(request.historical_data)
        features = engineer_features(df)
        
        # 2. Scale features
        features_scaled = scaler.transform(features)
        
        # 3. Reshape for CNN-LSTM
        X = features_scaled.reshape((1, features_scaled.shape[0], features_scaled.shape[1]))
        
        # 4. Predict
        prediction = model.predict(X)[0][0]
        
        # 5. Calculate confidence intervals (95%)
        std_dev = calculate_prediction_std(model, X)
        lower_bound = prediction - (1.96 * std_dev)
        upper_bound = prediction + (1.96 * std_dev)
        
        # 6. Calculate confidence score
        confidence = calculate_confidence_score(df, prediction)
        
        return PredictionResponse(
            amount=float(prediction),
            lower_bound=float(lower_bound),
            upper_bound=float(upper_bound),
            confidence=float(confidence),
            model_version="v1.0.0"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def engineer_features(df):
    """Extract 8 core features from historical data"""
    features = []
    # ... feature engineering logic
    return np.array(features)

def calculate_confidence_score(df, prediction):
    """Calculate confidence based on data quality and variance"""
    # More data = higher confidence
    # Lower variance = higher confidence
    # Recent trend match = higher confidence
    pass
```

### Frontend Implementation

**Dashboard Widget**: `MonthlyPredictionWidget.jsx`
```jsx
function MonthlyPredictionWidget() {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrediction();
  }, []);

  const fetchPrediction = async () => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    const response = await api.get('/predictions/monthly', {
      params: {
        month: nextMonth.getMonth() + 1,
        year: nextMonth.getFullYear()
      }
    });
    
    setPrediction(response.data);
    setLoading(false);
  };

  if (loading) return <Skeleton />;

  const getStatusColor = () => {
    if (prediction.amount > userBudget * 1.1) return 'red';
    if (prediction.amount > userBudget * 0.95) return 'yellow';
    return 'green';
  };

  return (
    <div className="prediction-widget bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">
        📊 Next Month Prediction
      </h3>
      
      <div className="text-center">
        <p className="text-gray-600 text-sm">Projected Spending</p>
        <p className={`text-4xl font-bold text-${getStatusColor()}-600 my-2`}>
          {formatCurrency(prediction.amount)}
        </p>
        <p className="text-sm text-gray-500">
          Range: {formatCurrency(prediction.lowerBound)} - {formatCurrency(prediction.upperBound)}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Confidence: {(prediction.confidence * 100).toFixed(1)}%
        </p>
      </div>

      {prediction.amount > userBudget && (
        <div className="mt-4 p-3 bg-red-50 rounded">
          <p className="text-sm text-red-600">
            ⚠️ Warning: Predicted to exceed budget by {formatCurrency(prediction.amount - userBudget)}
          </p>
          <button className="text-xs text-red-700 underline mt-1">
            View recommendations
          </button>
        </div>
      )}

      <div className="mt-4 pt-4 border-t">
        <p className="text-xs text-gray-500">
          Last updated: {formatDate(prediction.createdAt)}
        </p>
      </div>
    </div>
  );
}
```

**Chart**: `ForecastChart.jsx`
```jsx
import { Line } from 'react-chartjs-2';

function ForecastChart({ historical, forecast }) {
  const data = {
    labels: [...historical.map(h => h.month), ...forecast.map(f => f.month)],
    datasets: [
      {
        label: 'Historical',
        data: historical.map(h => h.amount),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
      },
      {
        label: 'Forecast',
        data: [
          ...Array(historical.length - 1).fill(null),
          historical[historical.length - 1].amount,
          ...forecast.map(f => f.amount)
        ],
        borderColor: 'rgb(16, 185, 129)',
        borderDash: [5, 5],
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
      },
      {
        label: 'Upper Bound',
        data: [
          ...Array(historical.length).fill(null),
          ...forecast.map(f => f.upperBound)
        ],
        borderColor: 'rgba(239, 68, 68, 0.3)',
        borderDash: [2, 2],
        fill: false,
      }
    ]
  };

  return <Line data={data} options={{ ... }} />;
}
```

---

## 12.2 Anomaly Detection

### Casos de Uso

**UC1: Spending Spikes**
- Detectar cuando gasto en categoría >> promedio
- Example: "Gastaste RD$8,000 en Entretenimiento (usual: RD$2,000)"

**UC2: Unusual Merchants**
- Primera transacción en merchant nuevo
- Example: "Primera compra en [Merchant] - ¿es correcto?"

**UC3: Frequency Changes**
- Cambios bruscos en frecuencia
- Example: "0 compras de supermercado esta semana (usual: 3)"

**UC4: Potential Fraud**
- Patterns que indican fraude
- Example: "Transacción de RD$500 en [Location] fuera de tu patrón"

### Algorithm: Isolation Forest

**Why Isolation Forest?**
- Unsupervised (no requiere etiquetas)
- Excelente para high-dimensional data
- Fast (<500ms para 10,000 samples)
- Robust a outliers legítimos

**How It Works**:
```
1. Build ensemble of isolation trees
2. For each transaction, measure path length to isolate
3. Anomalies tienen shorter path length (fáciles de aislar)
4. Score: shorter path = higher anomaly score
5. Threshold: score < -0.5 → flag as anomaly
```

### Backend Implementation

**Entity: Anomaly**
```csharp
public class Anomaly
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid TransactionId { get; set; }
    
    public AnomalyType Type { get; set; }
    public decimal AnomalyScore { get; set; } // -1.0 to 1.0
    public string Reason { get; set; }
    public string Features { get; set; } // JSON
    
    public AnomalyStatus Status { get; set; }
    public bool IsFalsePositive { get; set; }
    public DateTime DetectedAt { get; set; }
    public DateTime? ReviewedAt { get; set; }
    
    // Navigation
    public Transaction Transaction { get; set; }
}

public enum AnomalyType
{
    SpendingSpike,
    UnusualMerchant,
    FrequencyChange,
    PotentialFraud
}

public enum AnomalyStatus
{
    Pending,
    Reviewed,
    Confirmed,
    Dismissed
}
```

**Service: AnomalyDetectionService**
```csharp
public class AnomalyDetectionService
{
    private readonly IPythonBridge _pythonBridge;
    
    public async Task<AnomalyScore> ScoreTransactionAsync(Transaction transaction)
    {
        // 1. Extract features
        var features = await ExtractFeaturesAsync(transaction);
        
        // 2. Call Python ML service
        var score = await _pythonBridge.ScoreAnomalyAsync(
            model: "isolation_forest",
            features: features);
        
        // 3. Determine if anomaly
        if (score.Score < -0.5)
        {
            var anomaly = new Anomaly
            {
                UserId = transaction.UserId,
                TransactionId = transaction.Id,
                Type = DetermineAnomalyType(features, score),
                AnomalyScore = score.Score,
                Reason = GenerateExplanation(features, score),
                Status = AnomalyStatus.Pending,
                DetectedAt = DateTime.UtcNow
            };
            
            await _anomalyRepository.AddAsync(anomaly);
            await _notificationService.SendAnomalyAlertAsync(anomaly);
            
            return new AnomalyScore { IsAnomaly = true, Score = score.Score };
        }
        
        return new AnomalyScore { IsAnomaly = false, Score = score.Score };
    }
    
    private async Task<Dictionary<string, double>> ExtractFeaturesAsync(Transaction tx)
    {
        var userStats = await _transactionRepository
            .GetUserStatisticsAsync(tx.UserId, tx.CategoryId, months: 6);
        
        return new Dictionary<string, double>
        {
            ["amount_deviation"] = (tx.Amount - userStats.AvgAmount) / userStats.StdDev,
            ["merchant_novelty"] = userStats.MerchantCount > 0 ? 1.0 : 0.0,
            ["time_since_last"] = (DateTime.UtcNow - userStats.LastTransaction).TotalHours,
            ["day_of_week_anomaly"] = CalculateDayOfWeekAnomaly(tx, userStats),
            ["category_switch_rate"] = userStats.CategorySwitchRate
        };
    }
}
```

**Python ML Service**: Isolation Forest endpoint
```python
from sklearn.ensemble import IsolationForest
import joblib

# Load pre-trained model
isolation_forest = joblib.load('models/isolation_forest.pkl')

@app.post("/score/anomaly")
async def score_anomaly(features: dict):
    # Prepare feature vector
    X = np.array([[
        features['amount_deviation'],
        features['merchant_novelty'],
        features['time_since_last'],
        features['day_of_week_anomaly'],
        features['category_switch_rate']
    ]])
    
    # Predict anomaly score
    score = isolation_forest.decision_function(X)[0]
    
    # Score < 0 = anomaly, Score > 0 = normal
    return {
        "score": float(score),
        "is_anomaly": score < -0.5,
        "confidence": abs(score)
    }
```

### Frontend Implementation

**Anomaly Feed**: `AnomalyFeed.jsx`
```jsx
function AnomalyFeed() {
  const [anomalies, setAnomalies] = useState([]);

  useEffect(() => {
    fetchAnomalies();
  }, []);

  const handleReview = async (anomalyId, isFalsePositive) => {
    await api.put(`/anomalies/${anomalyId}/review`, {
      status: isFalsePositive ? 'Dismissed' : 'Confirmed',
      isFalsePositive
    });
    
    // Update local state
    setAnomalies(anomalies.filter(a => a.id !== anomalyId));
  };

  return (
    <div className="anomaly-feed">
      <h3>🚨 Unusual Activity</h3>
      
      {anomalies.map(anomaly => (
        <div key={anomaly.id} className="anomaly-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium">{anomaly.transaction.description}</p>
              <p className="text-sm text-gray-600">{anomaly.reason}</p>
              <p className="text-xs text-gray-400">
                {formatDate(anomaly.detectedAt)} · 
                Confidence: {(anomaly.anomalyScore * -100).toFixed(0)}%
              </p>
            </div>
            <span className={`badge badge-${getTypeColor(anomaly.type)}`}>
              {anomaly.type}
            </span>
          </div>
          
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => handleReview(anomaly.id, false)}
              className="btn-sm btn-danger"
            >
              Confirm Issue
            </button>
            <button
              onClick={() => handleReview(anomaly.id, true)}
              className="btn-sm btn-secondary"
            >
              Mark as Normal
            </button>
          </div>
        </div>
      ))}
      
      {anomalies.length === 0 && (
        <p className="text-center text-gray-500 py-8">
          ✅ No unusual activity detected
        </p>
      )}
    </div>
  );
}
```

---

## 12.3 Smart Insights Engine

### Implementation with DeepSeek-R1

**Prompt Template**:
```
You are a financial advisor analyzing a user's spending patterns.

User Data:
- Monthly Income: {income}
- Monthly Expenses: {expenses}
- Savings Rate: {savings_rate}%
- Top Categories: {top_categories}
- Recent Trends: {trends}

Historical Patterns:
{historical_summary}

Task: Generate 3-5 actionable insights to help the user optimize their finances.
Focus on:
1. Spending optimization opportunities
2. Budget reallocation suggestions
3. Savings acceleration tactics
4. Anomaly explanations

Format: Bullet points, concise, actionable.
```

**Service**: `InsightsEngine.cs`
```csharp
public class InsightsEngine
{
    private readonly IOllamaClient _ollama;
    
    public async Task<List<Insight>> GenerateInsightsAsync(Guid userId)
    {
        // 1. Gather user data
        var userData = await _dataAggregator.GetUserSummaryAsync(userId);
        
        // 2. Build prompt
        var prompt = BuildPrompt(userData);
        
        // 3. Call Ollama (DeepSeek-R1)
        var response = await _ollama.GenerateAsync(
            model: "deepseek-r1-distill-llama-8b",
            prompt: prompt,
            temperature: 0.7);
        
        // 4. Parse insights
        var insights = ParseInsights(response.Text);
        
        // 5. Store in database
        foreach (var insight in insights)
        {
            await _insightRepository.AddAsync(new Insight
            {
                UserId = userId,
                Title = insight.Title,
                Description = insight.Description,
                Category = insight.Category,
                Priority = insight.Priority,
                CreatedAt = DateTime.UtcNow
            });
        }
        
        return insights;
    }
}
```

---

## Performance Targets

| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| Monthly Forecast Accuracy (MAPE) | <15% | <20% |
| Anomaly Detection Recall | >85% | >75% |
| Anomaly Detection Precision | >70% | >60% |
| Forecast Generation Time | <2s | <5s |
| Anomaly Scoring Time | <500ms | <1s |
| Insights Generation Time | <3s | <10s |

---

## Testing Strategy

**Unit Tests**:
- Feature engineering functions
- Confidence scoring logic
- Anomaly type classification

**Integration Tests**:
- End-to-end prediction pipeline
- Anomaly detection + notification flow
- Insights generation + storage

**ML Model Tests**:
- Cross-validation (5-fold)
- Backtesting con datos históricos
- A/B testing vs baseline models

---

**Última Actualización**: 2025-11-03
**Next Step**: Setup Python ML service infrastructure
**Dependencies**: Feature 07 (data ingestion), Historical data (>6 months)
