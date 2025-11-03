# Feature 14 - Financial Chatbot with RAG

**Estado**: ⏸️ Pendiente
**Prioridad**: Alta
**Complejidad**: Alta
**Tiempo Estimado**: 2 semanas (10-12 días)
**ROI**: ALTO (50% reduction en clicks)

---

## Objetivo

Asistente conversacional que responde preguntas financieras en lenguaje natural usando RAG (Retrieval-Augmented Generation).
  
---

## Casos de Uso

1. **Financial Queries**: "¿Cuánto gasté en restaurantes en enero?"
2. **Analysis**: "¿Por qué subieron mis gastos de transporte?"
3. **Planning**: "¿Puedo ahorrar RD$10,000 en 6 meses?"
4. **Advice**: "¿Debo aumentar mi budget de entretenimiento?"
5. **Actions**: "Crea un presupuesto de RD$5,000 para Alimentación"

---

## Stack Técnico

**LLM**: Phi-3.5 (3.8B params)
- Optimized para conversaciones
- Lightweight pero powerful
- RAM: ~4GB
- Inference: <1s

**Vector DB**: ChromaDB
- Almacena embeddings de:
  - Transaction descriptions
  - Budget data
  - Savings goals
  - Historical insights
- Fast similarity search (<50ms)

**Cache**: Redis
- Conversation history
- Frequently asked questions
- Session management

---

## RAG Architecture

```
User Query → Embedding (Ollama)
    ↓
Vector Search (ChromaDB) → Top-5 relevant docs
    ↓
Context Building:
  - User financial data
  - Historical patterns
  - Related transactions
  - Budget status
    ↓
Prompt Template → Phi-3.5
    ↓
Response Generation + Citations
    ↓
[If Actionable] → Generate Action Buttons
    ↓
Store in Conversation History (Redis)
```

---

## Prompt Template

```
You are a personal financial advisor for {user_name}.

User Context:
- Monthly Income: {income}
- Monthly Expenses: {expenses}
- Savings Rate: {savings_rate}%
- Active Budgets: {budgets}
- Savings Goals: {goals}

Relevant Data:
{retrieved_context}

Conversation History:
{conversation_history}

User Question: {query}

Instructions:
1. Provide accurate, data-driven answers
2. Be concise but helpful
3. Suggest actionable next steps
4. Cite specific numbers when possible
5. If uncertain, say so

Response:
```

---

## Backend Implementation

**Entity**: `ChatMessage`
```csharp
public class ChatMessage
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid SessionId { get; set; }
    public string Role { get; set; } // "user", "assistant"
    public string Content { get; set; }
    public string RetrievedContext { get; set; } // JSON
    public List<string> Citations { get; set; }
    public List<ActionButton> SuggestedActions { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ActionButton
{
    public string Label { get; set; }
    public string ActionType { get; set; } // "create_budget", "view_transactions", etc.
    public string Payload { get; set; } // JSON
}
```

**Service**: `ChatbotService`
```csharp
public class ChatbotService
{
    private readonly IOllamaClient _ollama;
    private readonly IChromaDbClient _chromaDb;
    private readonly IRedisCache _redis;
    
    public async Task<ChatResponse> SendMessageAsync(
        Guid userId,
        Guid sessionId,
        string message)
    {
        // 1. Retrieve conversation history
        var history = await _redis.GetConversationHistoryAsync(sessionId);
        
        // 2. Generate embedding for query
        var embedding = await _ollama.GenerateEmbeddingAsync(message);
        
        // 3. Vector search in ChromaDB
        var relevantDocs = await _chromaDb.QueryAsync(
            collection: $"user_{userId}",
            embedding: embedding,
            topK: 5);
        
        // 4. Build context
        var context = await BuildContextAsync(userId, relevantDocs);
        
        // 5. Build prompt
        var prompt = BuildPrompt(message, context, history);
        
        // 6. Generate response
        var response = await _ollama.GenerateAsync(
            model: "phi3.5",
            prompt: prompt,
            temperature: 0.7,
            maxTokens: 500);
        
        // 7. Parse for actions
        var actions = ExtractActionButtons(response);
        
        // 8. Store message
        var chatMessage = new ChatMessage
        {
            UserId = userId,
            SessionId = sessionId,
            Role = "assistant",
            Content = response,
            RetrievedContext = JsonSerializer.Serialize(relevantDocs),
            SuggestedActions = actions,
            CreatedAt = DateTime.UtcNow
        };
        
        await _chatRepository.AddAsync(chatMessage);
        
        // 9. Update conversation history in Redis
        await _redis.AppendToHistoryAsync(sessionId, message, response);
        
        return new ChatResponse
        {
            Message = response,
            Actions = actions,
            Sources = relevantDocs.Select(d => d.Source).ToList()
        };
    }
}
```

---

## ChromaDB Population

**Indexing Pipeline**:
```csharp
public async Task IndexUserDataAsync(Guid userId)
{
    // 1. Index transactions
    var transactions = await _transactionRepository.GetByUserAsync(userId);
    foreach (var tx in transactions)
    {
        var embedding = await _ollama.GenerateEmbeddingAsync(
            $"{tx.Description} {tx.Category.Name} {tx.Amount} {tx.Date:yyyy-MM-dd}");
        
        await _chromaDb.AddAsync(
            collection: $"user_{userId}",
            id: tx.Id.ToString(),
            embedding: embedding,
            metadata: new {
                type = "transaction",
                description = tx.Description,
                amount = tx.Amount,
                category = tx.Category.Name,
                date = tx.Date
            });
    }
    
    // 2. Index budgets
    // 3. Index savings goals
    // 4. Index insights
}
```

---

## Frontend

**Component**: `ChatInterface.jsx`
```jsx
function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      const response = await api.post('/chat/message', {
        sessionId: currentSessionId,
        message: input
      });
      
      // Add assistant message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.data.message,
        actions: response.data.actions,
        sources: response.data.sources
      }]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-interface">
      <div className="messages-container">
        {messages.map((msg, idx) => (
          <ChatMessage key={idx} message={msg} />
        ))}
        {loading && <TypingIndicator />}
      </div>
      
      <div className="input-container">
        <SuggestedQuestions onSelect={setInput} />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask about your finances..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

function ChatMessage({ message }) {
  return (
    <div className={`message message-${message.role}`}>
      <div className="content">{message.content}</div>
      
      {message.actions && message.actions.length > 0 && (
        <div className="actions">
          {message.actions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => executeAction(action)}
              className="action-button"
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
      
      {message.sources && message.sources.length > 0 && (
        <div className="sources">
          <small>Sources: {message.sources.join(', ')}</small>
        </div>
      )}
    </div>
  );
}
```

**Suggested Questions**:
```jsx
const suggestedQuestions = [
  "¿Cuánto gasté este mes?",
  "¿En qué categoría gasto más?",
  "¿Puedo alcanzar mi meta de ahorro?",
  "Muéstrame mis gastos de restaurantes",
  "¿Cómo puedo ahorrar más?"
];
```

---

## Performance Targets

- Response Time: <3s
- Accuracy: 90%+ for factual queries
- User Satisfaction: >4/5 stars
- Context Relevance: >85%

---

## Security

- Query sanitization (prevent prompt injection)
- Rate limiting (10 queries/min)
- Data isolation (only user's data)
- No PII in logs

---

**Dependencies**: Ollama + Phi-3.5, ChromaDB, Redis, Indexed user data
**Next Step**: Setup ChromaDB, implement RAG pipeline, test queries
