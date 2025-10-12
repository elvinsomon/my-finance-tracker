erDiagram
    Users ||--o{ FinancialAccounts : "owns"
    Users ||--o{ Categories : "owns"
    Users ||--o{ Transactions : "owns"
    Users ||--o{ Budgets : "owns"
    Users ||--o{ SavingsGoals : "owns"
    Users ||--o{ Tags : "owns"
    Users ||--o{ RecurringTransactions : "owns"
    Users ||--o{ CategoryRules : "owns"
    Users ||--o{ Reminders : "owns"
    Users ||--o{ ImportHistory : "owns"
    
    FinancialAccounts ||--o{ Transactions : "contains"
    Categories ||--o{ Transactions : "categorizes"
    Categories ||--o{ TransactionItems : "categorizes"
    Categories ||--o{ Budgets : "has"
    Categories ||--o{ Categories : "parent-child"
    Categories ||--o{ CategoryRules : "assigns"
    
    Transactions ||--o{ TransactionItems : "has"
    Transactions ||--o{ TransactionTags : "has"
    Transactions ||--o{ SavingsContributions : "contributes"
    
    Tags ||--o{ TransactionTags : "tags"
    
    SavingsGoals ||--o{ SavingsContributions : "receives"
    
    RecurringTransactions }o--|| FinancialAccounts : "uses"
    RecurringTransactions }o--|| Categories : "uses"

    Users {
        uuid Id PK
        string Email
        string PasswordHash
        string FullName
        string DefaultCurrency
        datetime CreatedAt
        datetime UpdatedAt
    }
    
    FinancialAccounts {
        uuid Id PK
        uuid UserId FK
        string Name
        string Type
        string Currency
        decimal InitialBalance
        decimal CurrentBalance
        string Institution
        string AccountNumber
        boolean IsActive
        datetime CreatedAt
        datetime UpdatedAt
    }
    
    Categories {
        uuid Id PK
        uuid UserId FK
        string Name
        string Type
        uuid ParentCategoryId FK
        boolean IsSystem
        string Icon
        string Color
        boolean IsActive
        datetime CreatedAt
    }
    
    Transactions {
        uuid Id PK
        uuid UserId FK
        uuid AccountId FK
        uuid CategoryId FK
        string Type
        decimal Amount
        string Currency
        decimal ExchangeRate
        decimal AmountInBaseCurrency
        date Date
        string Description
        string PaymentMethod
        string Merchant
        boolean IsRecurring
        string RecurrencePattern
        string Status
        string Notes
        string AttachmentUrl
        string ImportedFrom
        string ExternalTransactionId
        datetime CreatedAt
        datetime UpdatedAt
    }
    
    TransactionItems {
        uuid Id PK
        uuid TransactionId FK
        uuid CategoryId FK
        string Description
        decimal Quantity
        decimal UnitPrice
        decimal TotalAmount
        string Notes
    }
    
    Tags {
        uuid Id PK
        uuid UserId FK
        string Name
        string Color
        datetime CreatedAt
    }
    
    TransactionTags {
        uuid Id PK
        uuid TransactionId FK
        uuid TagId FK
    }
    
    Budgets {
        uuid Id PK
        uuid UserId FK
        uuid CategoryId FK
        string Period
        decimal Amount
        string Currency
        date StartDate
        date EndDate
        boolean AlertThreshold80
        boolean AlertThreshold100
        boolean IsActive
        datetime CreatedAt
        datetime UpdatedAt
    }
    
    SavingsGoals {
        uuid Id PK
        uuid UserId FK
        string Name
        string Description
        decimal TargetAmount
        string Currency
        decimal CurrentAmount
        date TargetDate
        int Priority
        string Status
        string Icon
        string Color
        boolean IsEmergencyFund
        datetime CreatedAt
        datetime UpdatedAt
    }
    
    SavingsContributions {
        uuid Id PK
        uuid GoalId FK
        uuid TransactionId FK
        decimal Amount
        date Date
        string Notes
        datetime CreatedAt
    }
    
    ExchangeRates {
        uuid Id PK
        string FromCurrency
        string ToCurrency
        decimal Rate
        date Date
        string Source
        datetime CreatedAt
    }
    
    RecurringTransactions {
        uuid Id PK
        uuid UserId FK
        uuid AccountId FK
        uuid CategoryId FK
        string Type
        decimal Amount
        string Currency
        string Description
        string PaymentMethod
        string Frequency
        date StartDate
        date EndDate
        date NextDueDate
        boolean IsActive
        date LastProcessedDate
        datetime CreatedAt
        datetime UpdatedAt
    }
    
    CategoryRules {
        uuid Id PK
        uuid UserId FK
        uuid CategoryId FK
        string RuleName
        string MatchPattern
        string MatchField
        int Priority
        boolean IsActive
        datetime CreatedAt
    }
    
    Reminders {
        uuid Id PK
        uuid UserId FK
        string Type
        string Title
        string Description
        datetime DueDate
        boolean IsCompleted
        uuid RelatedEntityId
        string RelatedEntityType
        datetime CreatedAt
    }
    
    ImportHistory {
        uuid Id PK
        uuid UserId FK
        string FileName
        string FileType
        datetime ImportDate
        int TotalRecords
        int SuccessfulRecords
        int FailedRecords
        string Status
        string ErrorLog
    }