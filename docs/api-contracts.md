# API Contract - MyFinanceTracker

**Versión:** 1.0
**Base URL:** `http://localhost:5000/api`
**Content-Type:** `application/json`
**Autenticación:** Bearer Token (JWT) en header `Authorization: Bearer {token}`

---

## 📋 Tabla de Contenidos
1. [Authentication](#authentication)
2. [Transactions](#transactions)
3. [Categories](#categories)
4. [Budgets](#budgets)
5. [Financial Accounts](#financial-accounts)
6. [Exchange Rates](#exchange-rates)
7. [Common Models](#common-models)
8. [Error Handling](#error-handling)

---

## 1. Authentication

### POST /api/auth/register
**Descripción:** Registrar un nuevo usuario

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "fullName": "John Doe",
  "defaultCurrency": "DOP"
}
```

**Response (201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "email": "user@example.com",
    "fullName": "John Doe",
    "defaultCurrency": "DOP"
  },
  "expiresAt": "2025-10-13T20:00:00Z"
}
```

**Validaciones:**
- Email: required, valid email format, unique
- Password: required, min 6 characters, must contain uppercase, lowercase, digit
- FullName: required, max 255 characters
- DefaultCurrency: required, must be DOP, USD, or EUR

---

### POST /api/auth/login
**Descripción:** Autenticar usuario existente

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "email": "user@example.com",
    "fullName": "John Doe",
    "defaultCurrency": "DOP"
  },
  "expiresAt": "2025-10-13T20:00:00Z"
}
```

**Error (401 Unauthorized):**
```json
{
  "statusCode": 401,
  "message": "Invalid email or password",
  "errors": []
}
```

---

## 2. Transactions

### GET /api/transactions
**Descripción:** Obtener lista de transacciones del usuario autenticado

**Query Parameters:**
- `page` (int, optional, default: 1)
- `pageSize` (int, optional, default: 20, max: 100)
- `startDate` (date, optional, format: YYYY-MM-DD)
- `endDate` (date, optional, format: YYYY-MM-DD)
- `type` (string, optional, values: "Income", "Expense", "Transfer")
- `categoryId` (guid, optional)
- `accountId` (guid, optional)

**Headers:** `Authorization: Bearer {token}`

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "accountId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "accountName": "Cuenta Corriente",
      "categoryId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "categoryName": "Alimentación",
      "type": "Expense",
      "amount": 1500.00,
      "currency": "DOP",
      "amountInBaseCurrency": 1500.00,
      "date": "2025-10-12",
      "description": "Supermercado",
      "paymentMethod": "Tarjeta de Crédito",
      "merchant": "La Sirena",
      "status": "Completed",
      "createdAt": "2025-10-12T18:00:00Z"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "totalCount": 45,
  "totalPages": 3
}
```

---

### GET /api/transactions/{id}
**Descripción:** Obtener detalles de una transacción específica

**Headers:** `Authorization: Bearer {token}`

**Response (200 OK):**
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "accountId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "accountName": "Cuenta Corriente",
  "categoryId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "categoryName": "Alimentación",
  "type": "Expense",
  "amount": 1500.00,
  "currency": "DOP",
  "exchangeRate": 1.0,
  "amountInBaseCurrency": 1500.00,
  "date": "2025-10-12",
  "description": "Supermercado",
  "paymentMethod": "Tarjeta de Crédito",
  "merchant": "La Sirena",
  "status": "Completed",
  "notes": "Compra semanal",
  "attachmentUrl": null,
  "createdAt": "2025-10-12T18:00:00Z",
  "updatedAt": "2025-10-12T18:00:00Z"
}
```

---

### POST /api/transactions
**Descripción:** Crear una nueva transacción

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "accountId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "categoryId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "type": "Expense",
  "amount": 1500.00,
  "currency": "DOP",
  "date": "2025-10-12",
  "description": "Supermercado",
  "paymentMethod": "Tarjeta de Crédito",
  "merchant": "La Sirena",
  "notes": "Compra semanal"
}
```

**Response (201 Created):**
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "accountId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "accountName": "Cuenta Corriente",
  "categoryId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "categoryName": "Alimentación",
  "type": "Expense",
  "amount": 1500.00,
  "currency": "DOP",
  "exchangeRate": 1.0,
  "amountInBaseCurrency": 1500.00,
  "date": "2025-10-12",
  "description": "Supermercado",
  "paymentMethod": "Tarjeta de Crédito",
  "merchant": "La Sirena",
  "status": "Completed",
  "notes": "Compra semanal",
  "createdAt": "2025-10-12T18:00:00Z"
}
```

**Validaciones:**
- accountId: required, must exist, must belong to user
- categoryId: required, must exist, must belong to user
- type: required, must be "Income", "Expense", or "Transfer"
- amount: required, must be > 0
- currency: required, must be DOP, USD, or EUR
- date: required, cannot be in the future

---

### PUT /api/transactions/{id}
**Descripción:** Actualizar una transacción existente

**Headers:** `Authorization: Bearer {token}`

**Request Body:** (igual que POST, todos los campos son opcionales excepto los que se quieran cambiar)
```json
{
  "amount": 1600.00,
  "description": "Supermercado - actualizado"
}
```

**Response (200 OK):** Transacción actualizada completa

---

### DELETE /api/transactions/{id}
**Descripción:** Eliminar una transacción

**Headers:** `Authorization: Bearer {token}`

**Response (204 No Content)**

---

## 3. Categories

### GET /api/categories
**Descripción:** Obtener todas las categorías del usuario (incluye categorías del sistema)

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `type` (string, optional, values: "Income", "Expense")
- `includeInactive` (bool, optional, default: false)

**Response (200 OK):**
```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "Alimentación",
    "type": "Expense",
    "parentCategoryId": null,
    "isSystem": true,
    "icon": "🍽️",
    "color": "#f97316",
    "isActive": true,
    "subcategories": [
      {
        "id": "4fa85f64-5717-4562-b3fc-2c963f66afa6",
        "name": "Supermercado",
        "type": "Expense",
        "parentCategoryId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "isSystem": true,
        "icon": null,
        "color": null,
        "isActive": true
      }
    ]
  }
]
```

---

### POST /api/categories
**Descripción:** Crear una nueva categoría

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "name": "Gimnasio",
  "type": "Expense",
  "parentCategoryId": null,
  "icon": "💪",
  "color": "#8b5cf6"
}
```

**Response (201 Created):**
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "Gimnasio",
  "type": "Expense",
  "parentCategoryId": null,
  "isSystem": false,
  "icon": "💪",
  "color": "#8b5cf6",
  "isActive": true
}
```

**Validaciones:**
- name: required, max 255 characters, unique per user
- type: required, must be "Income" or "Expense"
- parentCategoryId: optional, must exist if provided

---

## 4. Budgets

### GET /api/budgets
**Descripción:** Obtener presupuestos del usuario

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `isActive` (bool, optional, default: true)
- `startDate` (date, optional) - filtrar presupuestos que incluyan esta fecha
- `endDate` (date, optional)

**Response (200 OK):**
```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "categoryId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "categoryName": "Alimentación",
    "period": "Monthly",
    "amount": 15000.00,
    "currency": "DOP",
    "startDate": "2025-10-01",
    "endDate": "2025-10-31",
    "spent": 8500.00,
    "remaining": 6500.00,
    "percentageUsed": 56.67,
    "alertThreshold80": true,
    "alertThreshold100": true,
    "isActive": true
  }
]
```

---

### POST /api/budgets
**Descripción:** Crear un nuevo presupuesto

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "categoryId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "period": "Monthly",
  "amount": 15000.00,
  "currency": "DOP",
  "startDate": "2025-10-01",
  "endDate": "2025-10-31",
  "alertThreshold80": true,
  "alertThreshold100": true
}
```

**Response (201 Created):** Budget completo con `spent`, `remaining`, `percentageUsed` calculados

**Validaciones:**
- categoryId: required, must exist, must belong to user
- period: required, must be "Monthly", "Yearly", or "Custom"
- amount: required, must be > 0
- startDate: required
- endDate: required, must be after startDate

---

## 5. Financial Accounts

### GET /api/accounts
**Descripción:** Obtener cuentas financieras del usuario

**Headers:** `Authorization: Bearer {token}`

**Response (200 OK):**
```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "Cuenta Corriente",
    "type": "Bank",
    "currency": "DOP",
    "currentBalance": 50000.00,
    "institution": "Banco Popular",
    "isActive": true
  }
]
```

---

### POST /api/accounts
**Descripción:** Crear una nueva cuenta financiera

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "name": "Cuenta Corriente",
  "type": "Bank",
  "currency": "DOP",
  "initialBalance": 50000.00,
  "institution": "Banco Popular",
  "accountNumber": "****1234"
}
```

**Response (201 Created):**
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "Cuenta Corriente",
  "type": "Bank",
  "currency": "DOP",
  "initialBalance": 50000.00,
  "currentBalance": 50000.00,
  "institution": "Banco Popular",
  "accountNumber": "****1234",
  "isActive": true
}
```

**Validaciones:**
- name: required, max 255 characters
- type: required, values: "Bank", "CreditCard", "Cash", "DigitalWallet"
- currency: required, must be DOP, USD, or EUR
- initialBalance: required

---

## 6. Exchange Rates

### GET /api/exchangerates
**Descripción:** Obtener tasas de cambio

**Query Parameters:**
- `fromCurrency` (string, optional)
- `toCurrency` (string, optional)
- `date` (date, optional, default: today)

**Response (200 OK):**
```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "fromCurrency": "USD",
    "toCurrency": "DOP",
    "rate": 58.50,
    "date": "2025-10-12",
    "source": "Manual"
  }
]
```

---

## 7. Common Models

### PaginatedResponse<T>
```json
{
  "data": [],
  "page": 1,
  "pageSize": 20,
  "totalCount": 100,
  "totalPages": 5
}
```

### ErrorResponse
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    "Amount must be greater than 0",
    "Date cannot be in the future"
  ]
}
```

---

## 8. Error Handling

### Status Codes

- **200 OK**: Successful GET request
- **201 Created**: Successful POST request
- **204 No Content**: Successful DELETE request
- **400 Bad Request**: Validation error
- **401 Unauthorized**: Missing or invalid token
- **403 Forbidden**: User doesn't have permission
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Unexpected server error

### Error Response Format
Todas las respuestas de error siguen este formato:

```json
{
  "statusCode": 400,
  "message": "Human-readable error message",
  "errors": [
    "Specific error detail 1",
    "Specific error detail 2"
  ]
}
```

---

## 9. Date & Time Format

- **Fechas**: ISO 8601 format `YYYY-MM-DD` (ej: "2025-10-12")
- **DateTimes**: ISO 8601 format con timezone UTC `YYYY-MM-DDTHH:mm:ssZ` (ej: "2025-10-12T18:00:00Z")
- Todas las fechas/horas se devuelven en UTC

---

## 10. Autenticación JWT

### Token Structure
El token JWT contiene los siguientes claims:
- `sub`: User ID (guid)
- `email`: User email
- `exp`: Expiration timestamp
- `iss`: Issuer (FinanceManagerAPI)
- `aud`: Audience (FinanceManagerClient)

### Header Format
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Expiration
- Default: 24 horas
- El frontend debe manejar 401 Unauthorized y redirigir a login

---

## 11. CORS

Allowed Origins:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (backup)

Allowed Methods: GET, POST, PUT, DELETE, OPTIONS
Allowed Headers: Authorization, Content-Type
Credentials: true

---

## 12. Notas Importantes

1. **Case Sensitivity**:
   - Backend usa PascalCase en C# pero Mapster/JSON serializer convierte a camelCase en JSON
   - Frontend debe usar camelCase en requests/responses

2. **Guids**:
   - Formato: `3fa85f64-5717-4562-b3fc-2c963f66afa6`
   - Sin guiones también válido: `3fa85f645717456b3fc2c963f66afa6`

3. **Monedas válidas**: DOP, USD, EUR

4. **Tipos de transacción válidos**: Income, Expense, Transfer

5. **User ID**:
   - Extraído automáticamente del JWT
   - No se envía en request body
   - Backend lo agrega automáticamente a las entidades
