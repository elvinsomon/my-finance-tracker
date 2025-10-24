# Feature 4: Intelligent CSV Bank Statement Import System

## Executive Summary

This specification defines a comprehensive, scalable system for importing bank statements in CSV format into MyFinanceTracker. The design prioritizes flexibility through bank profile templates, intelligent duplicate detection, and rule-based auto-categorization. The architecture uses Strategy and Factory patterns to support multiple bank formats without modifying core business logic.

**Key Goals:**
- Import 1000+ transactions in under 5 seconds
- Support multiple bank formats through configurable templates
- Intelligent duplicate detection and reconciliation
- Rule-based auto-categorization with confidence scoring
- Intuitive user workflow with preview and confirmation

**Technical Decisions:**
- **File Storage**: Local filesystem (`/uploads/imports/`)
- **Processing**:
  - Synchronous for files <1000 rows
  - Asynchronous (background job) for files ≥1000 rows
- **CSV Library**: CsvHelper with custom bank-specific parsers
- **Implementation Strategy**: Incremental (5 phases)

---

## Implementation Phases

### Phase 1: MVP Basic Import (Week 1) 🎯 HIGH PRIORITY
**Objective:** Get basic CSV import working for Scotia and VIMENCA banks

**Scope:**
- ✅ CSV file upload (drag-and-drop)
- ✅ Basic parsers for Scotia and VIMENCA
- ✅ Simple preview table
- ✅ Manual category assignment
- ✅ Import to selected FinancialAccount
- ❌ NO auto-categorization
- ❌ NO duplicate detection
- ❌ NO bank profile management
- ❌ NO import history

**Deliverables:**
- Backend: 2 entities (ImportHistory basic, Transaction extensions)
- Backend: 2 parsers (ScotiaCsvParser, VimencaCsvParser)
- Backend: 3 endpoints (upload, preview, confirm)
- Frontend: 1 page (Import with upload + preview)
- Migration: AddImportBasicFields

**Success Criteria:**
- User can upload Scotia/VIMENCA CSV
- Preview shows parsed transactions
- Transactions import successfully to database

**Estimation:** 2-3 days with agents

---

### Phase 2: Duplicate Detection (Week 2) 🎯 HIGH PRIORITY
**Objective:** Prevent re-importing existing transactions

**Scope:**
- ✅ 3-stage duplicate detection algorithm
- ✅ Visual indicators in preview
- ✅ Skip confirmed duplicates
- ✅ Allow override for false positives

**Deliverables:**
- Backend: DuplicateDetectionService
- Backend: ExternalTransactionId field in Transaction
- Frontend: Duplicate status badges and filters

**Success Criteria:**
- System detects >95% of actual duplicates
- False positive rate <5%
- Users can override detection

**Estimation:** 1-2 days with agents

---

### Phase 3: Auto-Categorization with Rules (Week 3) 🟡 MEDIUM PRIORITY
**Objective:** Automatically suggest categories based on patterns

**Scope:**
- ✅ CategoryRule entity and repository
- ✅ Rule engine with pattern matching
- ✅ Confidence scoring
- ✅ UI for managing rules
- ✅ Basic learning system (auto-create rules)

**Deliverables:**
- Backend: CategoryRule entity + migration
- Backend: CategoryRuleEngine service
- Backend: 4 endpoints (CRUD rules)
- Frontend: Category Rules management page
- Frontend: Confidence indicators in preview

**Success Criteria:**
- System auto-categorizes >70% of transactions
- Users can create/edit/delete rules
- Learning system creates rules after 3+ manual categorizations

**Estimation:** 2-3 days with agents

---

### Phase 4: Bank Profiles & Import History (Week 4) 🟡 MEDIUM PRIORITY
**Objective:** Support multiple banks and audit trail

**Scope:**
- ✅ BankProfile entity for format templates
- ✅ Custom bank profile creation
- ✅ Import history with details
- ✅ Rollback functionality
- ✅ Auto-detection of bank format

**Deliverables:**
- Backend: BankProfile entity + migration
- Backend: Bank profile detection algorithm
- Backend: Import history endpoints
- Backend: Rollback endpoint
- Frontend: Bank Profiles management page
- Frontend: Import History page with rollback

**Success Criteria:**
- System detects known banks with >85% confidence
- Users can create custom profiles
- Import history tracks all imports
- Rollback works for unmodified imports

**Estimation:** 2-3 days with agents

---

### Phase 5: Polish & Optimization (Week 5) 🟢 LOW PRIORITY
**Objective:** Performance improvements and UX enhancements

**Scope:**
- ✅ Async processing for large files
- ✅ Batch insert optimization
- ✅ Progress indicators
- ✅ Error export functionality
- ✅ Advanced filters in preview
- ✅ Column mapping customization

**Deliverables:**
- Backend: Async job infrastructure
- Backend: Performance optimizations (indexing, caching)
- Frontend: Advanced UX improvements
- Testing: Full test suite

**Success Criteria:**
- Import 5000 rows in <15 seconds
- No UI blocking during import
- All edge cases handled gracefully

**Estimation:** 1-2 days

---

**Total Estimated Timeline:** 5 weeks sequential, or 1-1.5 weeks with parallel agent execution

---

## 1. Problem Statement

### Business Context

Users currently must manually enter every transaction, which is:
- **Time-consuming**: 50-100 monthly transactions = hours of data entry
- **Error-prone**: Manual typing leads to mistakes in amounts, dates, descriptions
- **Demotivating**: High friction discourages consistent financial tracking

Most banks provide CSV exports, but formats vary significantly across institutions. A robust import system must handle this variability while maintaining data integrity and preventing duplicates.

### Technical Challenges

1. **Format Diversity**: Different CSV structures, date formats, encoding, delimiters
2. **Duplicate Detection**: Matching imported transactions with existing records despite variations in description, timing, or amount precision
3. **Categorization**: Automatically suggesting categories based on merchant names and transaction patterns
4. **Data Integrity**: Ensuring transactions maintain referential integrity with accounts, categories, and budgets
5. **Scalability**: Adding new bank formats without code changes to core services

---

## 2. Functional Requirements

### FR-1: Bank Profile Management

**Description**: System must support configurable bank templates that define CSV parsing rules.

**User Stories:**
- As a user, I want to select my bank from a predefined list so the system knows how to parse my CSV
- As a user, I want to create custom bank profiles for unsupported banks
- As an admin, I want to add new bank templates without modifying code

**Acceptance Criteria:**
- System includes 5+ predefined bank profiles (Scotia, VIMENCA, BHD, Popular, Banreservas)
- Users can create custom profiles through UI
- Profiles specify: column mappings, date format, amount format, header row count, encoding

### FR-2: CSV Upload and Parsing

**Description**: Users can upload CSV files, system parses and validates content.

**User Stories:**
- As a user, I want to drag-and-drop or browse for my CSV file
- As a user, I want to specify the currency of amounts in the file if not auto-detected
- As a user, I want the system to detect my bank automatically if possible
- As a user, I want clear error messages if my CSV is invalid

**Acceptance Criteria:**
- Supports drag-and-drop and file browser upload
- File size limit: 10MB (~ 50,000 transactions)
- **⚠️ CRITICAL**: User MUST specify currency during upload if not detected in file
- Validates: file format, encoding, required columns presence, currency selection
- Auto-detects bank profile with 90%+ accuracy for known banks (APAP, Vimenca)
- Provides fallback to manual bank selection
- Currency detection:
  - APAP: Auto-detect from monto column (DOP/USD explicit)
  - Vimenca: User must select currency (DOP assumed by default)

### FR-3: Column Mapping and Preview

**Description**: System maps CSV columns to transaction fields, shows preview before import.

**User Stories:**
- As a user, I want to see a preview of my transactions before importing
- As a user, I want to adjust column mappings if auto-detection is wrong
- As a user, I want to see how many transactions will be imported vs skipped as duplicates

**Acceptance Criteria:**
- Preview shows first 20 transactions
- Display: date, description, amount, suggested category, duplicate status
- Allow manual adjustment of column mappings
- Show summary: X new, Y duplicates, Z invalid

### FR-4: Duplicate Detection

**Description**: Prevent importing transactions that already exist in the system.

**User Stories:**
- As a user, I want the system to skip transactions I've already imported
- As a user, I want to see which transactions are duplicates and why
- As a user, I want to force import a transaction if the duplicate detection is wrong

**Acceptance Criteria:**
- Matching algorithm considers: date (±2 days), amount (exact), external reference (exact), description (80% similarity)
- Three-tier matching: Exact match (skip), Likely duplicate (warn), New (import)
- Users can override duplicate detection in preview
- System stores external transaction IDs to prevent re-import

### FR-5: Auto-Categorization with Rules

**Description**: Automatically suggest categories based on merchant names and patterns.

**User Stories:**
- As a user, I want the system to suggest categories for imported transactions
- As a user, I want to create rules like "ESSO → Transportation"
- As a user, I want the system to learn from my manual categorizations

**Acceptance Criteria:**
- System matches description keywords against category rules
- Rules support: exact match, contains, regex patterns
- Priority system for overlapping rules
- Confidence scores: High (>90%), Medium (70-90%), Low (<70%)
- Users can create/edit rules through UI
- System auto-creates rules when user manually categorizes imported transactions 3+ times

### FR-6: Financial Account Association

**Description**: Imported transactions must be linked to a specific financial account.

**User Stories:**
- As a user, I want to select which bank account these transactions belong to
- As a user, I want the system to remember my bank → account mapping for future imports
- As a user, I want to import to different accounts in the same session

**Acceptance Criteria:**
- User selects FinancialAccount before upload
- Bank profile can be saved with default account association
- Multi-account support in single import session (advanced feature)

### FR-7: Import Confirmation and Execution

**Description**: Finalize import with full transaction creation and account balance updates.

**User Stories:**
- As a user, I want to review a final summary before confirming import
- As a user, I want to see import progress for large files
- As a user, I want a detailed report after import completes

**Acceptance Criteria:**
- Final confirmation screen with summary statistics
- Progress indicator for imports >100 transactions
- Async processing for imports ≥1000 rows
- Post-import report: X imported, Y duplicates skipped, Z errors
- Transactions appear immediately in transaction list
- Account balances update correctly

### FR-8: Import History and Audit Trail

**Description**: Track all imports for audit and potential rollback.

**User Stories:**
- As a user, I want to see a history of all my imports
- As a user, I want to rollback an import if I made a mistake
- As a user, I want to see details of past imports (file name, date, transaction count)

**Acceptance Criteria:**
- Import history page with list of all imports
- Details per import: date, file name, bank, account, transaction count, status
- Rollback feature: soft-delete imported transactions (mark IsActive = false)
- Cannot rollback if imported transactions have been modified by user
- Download original CSV from import history

### FR-9: Error Handling and Validation

**Description**: Robust validation with clear error messages.

**User Stories:**
- As a user, I want clear error messages if my CSV has problems
- As a user, I want to see which specific rows failed and why
- As a user, I want the option to skip invalid rows and import valid ones

**Acceptance Criteria:**
- Validates each row: date format, amount format, required fields
- Error types: Invalid date, Invalid amount, Missing required field, Duplicate
- Option to import valid rows and skip invalid ones
- Export error report as CSV for user review

---

## 3. Technical Architecture

### 3.1 System Overview

The import system follows MyFinanceTracker's layered architecture with specialized components for parsing and rule matching:

```
┌─────────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER (API)                     │
│  ┌────────────────┐  ┌──────────────────┐  ┌─────────────────┐ │
│  │ Import         │  │ BankProfile      │  │ CategoryRule    │ │
│  │ Controller     │  │ Controller       │  │ Controller      │ │
│  └────────┬───────┘  └────────┬─────────┘  └────────┬────────┘ │
│           │                   │                      │          │
│  ┌────────▼───────────────────▼──────────────────────▼────────┐ │
│  │           Import Orchestration Service                     │ │
│  │  - Coordinate upload, parsing, preview, confirmation       │ │
│  └────────┬───────────────────────────────────────────────────┘ │
└───────────┼─────────────────────────────────────────────────────┘
            │
┌───────────▼─────────────────────────────────────────────────────┐
│                     DOMAIN LAYER (Core)                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ CSV Parser      │  │ Duplicate       │  │ Category Rule   │ │
│  │ (Strategy)      │  │ Detector        │  │ Engine          │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Entities: BankProfile, ImportHistory, CategoryRule,         ││
│  │           ImportedTransaction (staging)                     ││
│  └─────────────────────────────────────────────────────────────┘│
└───────────┬──────────────────────────────────────────────────────┘
            │
┌───────────▼─────────────────────────────────────────────────────┐
│                  INFRASTRUCTURE LAYER                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ BankProfile     │  │ ImportHistory   │  │ CategoryRule    │ │
│  │ Repository      │  │ Repository      │  │ Repository      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            ApplicationDbContext (PostgreSQL)              │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### 3.2 Design Patterns

#### Strategy Pattern: CSV Parsing

Different banks require different parsing strategies. The Strategy pattern allows runtime selection of the appropriate parser.

```
┌────────────────────────┐
│   ICsvParserStrategy   │
│  + Parse(stream): []   │
└───────────▲────────────┘
            │
    ┌───────┴───────┬──────────────┬────────────┐
    │               │              │            │
┌───▼────┐  ┌───────▼──┐  ┌────────▼───┐  ┌────▼──────┐
│ Scotia │  │ VIMENCA  │  │ Generic    │  │ Custom    │
│ Parser │  │ Parser   │  │ Parser     │  │ Parser    │
└────────┘  └──────────┘  └────────────┘  └───────────┘
```

#### Factory Pattern: Parser Creation

Factory creates appropriate parser based on bank profile:

```
┌────────────────────────┐
│  CsvParserFactory      │
│  + Create(profile)     │
└───────────┬────────────┘
            │
            ▼
     Select parser based on
     BankProfile.ParserType
```

#### Chain of Responsibility: Duplicate Detection

Multiple matchers evaluate in sequence:

```
ExactMatchDetector → ReferenceMatchDetector → FuzzyMatchDetector → NoMatch
```

### 3.3 File Storage Strategy

**Location**: `/uploads/imports/` (local filesystem)

**Structure**:
```
/uploads/
  /imports/
    /{userId}/
      /{year}/
        /{month}/
          {guid}_original.csv      # Original uploaded file
          {guid}_processed.json    # Parsed data cache (optional)
```

**Lifecycle**:
- Files stored upon upload
- Kept for 30 days after import
- Cleanup job runs daily (delete files >30 days)
- Users can download from import history within 30 days

**Security**:
- Outside web root
- Restricted permissions (app user only)
- Validated file types and sizes

### 3.4 Processing Strategy

**Synchronous Processing** (< 1000 rows):
- User waits for completion
- Direct API response with results
- Max timeout: 30 seconds

**Asynchronous Processing** (≥ 1000 rows):
- Background job queued (Hangfire or similar)
- Immediate response with job ID
- Frontend polls for status
- Email notification on completion

---

## 4. Data Model

### 4.1 Core Entities

#### BankProfile

```csharp
public class BankProfile
{
    public int Id { get; set; }
    public string Name { get; set; } // "Scotia Bank", "VIMENCA"
    public string Code { get; set; } // "SCOTIA", "VIMENCA" (unique)
    public string ParserType { get; set; } // "Generic", "Scotia", "VIMENCA"

    // CSV Structure
    public int HeaderRowCount { get; set; } // Skip first N rows
    public string DateFormat { get; set; } // "DD/MM/YYYY", "MM/DD/YYYY"
    public string Delimiter { get; set; } // ",", ";", "\t"
    public string Encoding { get; set; } // "UTF-8", "ISO-8859-1"
    public bool HasQuotedFields { get; set; }

    // Column Mappings (JSON)
    public string ColumnMappings { get; set; }
    /* Example JSON:
    {
        "date": 0, // Column index or name
        "description": 2,
        "amount": 3,
        "reference": 1,
        "balance": 4 // Optional
    }
    */

    // System Fields
    public bool IsSystemDefined { get; set; } // True for predefined banks
    public bool IsActive { get; set; }
    public Guid? UserId { get; set; } // Null for system profiles
    public Guid? DefaultFinancialAccountId { get; set; }

    // Navigation
    public User User { get; set; }
    public FinancialAccount DefaultFinancialAccount { get; set; }
    public ICollection<ImportHistory> ImportHistories { get; set; }
}
```

#### ImportHistory

```csharp
public class ImportHistory
{
    public int Id { get; set; }
    public Guid UserId { get; set; }
    public Guid FinancialAccountId { get; set; }
    public int? BankProfileId { get; set; }

    // File Details
    public string OriginalFileName { get; set; }
    public string StoredFileName { get; set; } // GUID-based name in storage
    public long FileSizeBytes { get; set; }

    // Import Results
    public DateTime ImportDate { get; set; }
    public int TotalRowsProcessed { get; set; }
    public int TransactionsImported { get; set; }
    public int DuplicatesSkipped { get; set; }
    public int ErrorsEncountered { get; set; }
    public string ErrorDetails { get; set; } // JSON array of errors

    // Status
    public ImportStatus Status { get; set; } // Pending, Processing, Completed, Failed, RolledBack
    public bool CanRollback { get; set; }
    public DateTime? RolledBackDate { get; set; }

    // Navigation
    public User User { get; set; }
    public FinancialAccount FinancialAccount { get; set; }
    public BankProfile BankProfile { get; set; }
    public ICollection<Transaction> ImportedTransactions { get; set; }
}

public enum ImportStatus
{
    Pending = 0,
    Processing = 1,
    Completed = 2,
    Failed = 3,
    RolledBack = 4
}
```

#### CategoryRule

```csharp
public class CategoryRule
{
    public int Id { get; set; }
    public Guid UserId { get; set; }
    public Guid CategoryId { get; set; }

    // Rule Definition
    public string RuleName { get; set; } // "Gas Stations"
    public RuleMatchType MatchType { get; set; } // Contains, StartsWith, EndsWith, Regex, Exact
    public string Pattern { get; set; } // "ESSO", "^SUPERM\.", etc.
    public bool IsCaseSensitive { get; set; }

    // Priority & Learning
    public int Priority { get; set; } // Higher = evaluated first (1-100)
    public int MatchCount { get; set; } // How many times this rule has matched
    public DateTime? LastMatchedDate { get; set; }
    public bool IsAutoGenerated { get; set; } // Created by system learning

    // System Fields
    public bool IsActive { get; set; }
    public DateTime CreatedDate { get; set; }

    // Navigation
    public User User { get; set; }
    public Category Category { get; set; }
}

public enum RuleMatchType
{
    Contains = 0,      // Description contains pattern
    StartsWith = 1,    // Description starts with pattern
    EndsWith = 2,      // Description ends with pattern
    Exact = 3,         // Exact match (case-sensitive optional)
    Regex = 4          // Regular expression
}
```

#### Transaction Extensions

Add fields to existing `Transaction` entity:

```csharp
public class Transaction
{
    // ... existing fields ...

    // Import-specific fields
    public int? ImportHistoryId { get; set; }
    public string ExternalTransactionId { get; set; } // Bank's reference number
    public bool IsImported { get; set; }
    public Guid? SuggestedCategoryId { get; set; } // Original auto-suggestion
    public decimal? CategoryConfidenceScore { get; set; } // 0.0 - 1.0

    // Navigation
    public ImportHistory ImportHistory { get; set; }
}
```

### 4.2 Staging/DTO Entities

#### ImportedTransactionDto (Staging)

Used during preview before final commit:

```csharp
public class ImportedTransactionDto
{
    // CSV Data
    public DateTime TransactionDate { get; set; }
    public string Description { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; }
    public string ExternalReference { get; set; }
    public decimal? Balance { get; set; } // If provided in CSV

    // Auto-Categorization
    public Guid? SuggestedCategoryId { get; set; }
    public string SuggestedCategoryName { get; set; }
    public decimal ConfidenceScore { get; set; }
    public string MatchedRuleName { get; set; }

    // Duplicate Detection
    public DuplicateStatus DuplicateStatus { get; set; }
    public Guid? ExistingTransactionId { get; set; }
    public string DuplicateReason { get; set; }

    // Validation
    public bool IsValid { get; set; }
    public List<string> ValidationErrors { get; set; }

    // Row tracking
    public int RowNumber { get; set; }
}

public enum DuplicateStatus
{
    New = 0,
    LikelyDuplicate = 1,
    ConfirmedDuplicate = 2
}
```

---

## 5. API Specifications

### 5.1 Bank Profiles API

#### GET /api/bankprofiles

Get all bank profiles (system + user's custom).

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Scotia Bank",
      "code": "SCOTIA",
      "parserType": "Scotia",
      "isSystemDefined": true,
      "defaultFinancialAccountId": null
    },
    {
      "id": 5,
      "name": "My Custom Bank",
      "code": "CUSTOM_001",
      "parserType": "Generic",
      "isSystemDefined": false,
      "defaultFinancialAccountId": "uuid"
    }
  ]
}
```

#### POST /api/bankprofiles

Create custom bank profile.

**Request:**
```json
{
  "name": "Banco Popular",
  "code": "POPULAR",
  "parserType": "Generic",
  "headerRowCount": 1,
  "dateFormat": "DD/MM/YYYY",
  "delimiter": ",",
  "encoding": "UTF-8",
  "hasQuotedFields": true,
  "columnMappings": {
    "date": "Fecha",
    "description": "Descripcion",
    "amount": "Monto",
    "reference": "Referencia"
  },
  "defaultFinancialAccountId": "uuid"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": 6,
    "name": "Banco Popular",
    "code": "POPULAR",
    "message": "Bank profile created successfully"
  }
}
```

### 5.2 Import API

#### POST /api/imports/upload

Upload CSV file and get initial analysis.

**Request (multipart/form-data):**
- `file`: CSV file (required)
- `financialAccountId`: Guid (required)
- `currency`: string (required - DOP/USD/EUR) **⚠️ CRITICAL FIELD**
- `bankProfileId`: int (optional - auto-detect if not provided)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "uploadId": "550e8400-e29b-41d4-a716-446655440000",
    "detectedBankProfile": {
      "id": 1,
      "name": "APAP (Asociación Popular)",
      "confidence": 0.95
    },
    "alternativeProfiles": [
      {"id": 2, "name": "Vimenca", "confidence": 0.45}
    ],
    "fileInfo": {
      "fileName": "AsociacionPopular(APAP)-Statement.CSV",
      "sizeBytes": 45320,
      "rowCount": 87,
      "encoding": "UTF-8"
    },
    "currency": "DOP",
    "currencyDetected": true,
    "preview": [
      {
        "rowNumber": 1,
        "date": "2025-10-02",
        "description": "CASHBACK SALONES BAR",
        "amount": 364.51,
        "currency": "DOP",
        "reference": "VT252750161000420000006"
      }
    ],
    "columnMappings": {
      "date": 0,
      "description": 2,
      "amount": 3,
      "reference": 1
    }
  }
}
```

#### POST /api/imports/{uploadId}/analyze

Analyze uploaded file with full duplicate detection and categorization.

**Request:**
```json
{
  "bankProfileId": 1,
  "financialAccountId": "uuid",
  "columnMappings": {
    "date": 0,
    "description": 2,
    "amount": 3,
    "reference": 1
  }
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "uploadId": "550e8400-e29b-41d4-a716-446655440000",
    "summary": {
      "totalRows": 87,
      "newTransactions": 72,
      "duplicates": 12,
      "errors": 3,
      "validTransactions": 72
    },
    "transactions": [
      {
        "rowNumber": 1,
        "transactionDate": "2024-07-08",
        "description": "SUPERM. NACIONAL 27 DE FE",
        "amount": -1922.70,
        "currency": "DOP",
        "externalReference": "VT241900109090720001922",
        "suggestedCategoryId": "uuid",
        "suggestedCategoryName": "Groceries",
        "confidenceScore": 0.89,
        "matchedRuleName": "Supermarket Keywords",
        "duplicateStatus": "New",
        "isValid": true,
        "validationErrors": []
      },
      {
        "rowNumber": 2,
        "transactionDate": "2024-07-08",
        "description": "ESSO LA LIRA",
        "amount": -3233.70,
        "currency": "DOP",
        "externalReference": "VT241900109097020001233",
        "suggestedCategoryId": "uuid",
        "suggestedCategoryName": "Transportation",
        "confidenceScore": 0.95,
        "matchedRuleName": "Gas Stations",
        "duplicateStatus": "ConfirmedDuplicate",
        "existingTransactionId": "uuid",
        "duplicateReason": "Exact match on reference number",
        "isValid": true,
        "validationErrors": []
      }
    ],
    "errors": [
      {
        "rowNumber": 15,
        "errors": ["Invalid date format", "Amount is required"]
      }
    ]
  }
}
```

#### POST /api/imports/{uploadId}/confirm

Confirm and execute import.

**Request:**
```json
{
  "skipDuplicates": true,
  "skipErrors": true,
  "overrides": [
    {
      "rowNumber": 5,
      "categoryId": "uuid",
      "importAnyway": false
    }
  ]
}
```

**Response 200 (Synchronous <1000 rows):**
```json
{
  "success": true,
  "data": {
    "importHistoryId": 42,
    "summary": {
      "transactionsImported": 72,
      "duplicatesSkipped": 12,
      "errorsSkipped": 3,
      "totalProcessed": 87
    },
    "importedTransactionIds": ["uuid1", "uuid2", "..."],
    "financialAccountId": "uuid",
    "newAccountBalance": 125430.50
  }
}
```

**Response 202 (Asynchronous ≥1000 rows):**
```json
{
  "success": true,
  "data": {
    "jobId": "job-550e8400-e29b-41d4-a716-446655440000",
    "status": "Processing",
    "message": "Import queued for processing. You will be notified when complete.",
    "estimatedCompletionTime": "2024-10-24T14:35:00Z"
  }
}
```

#### GET /api/imports/history

Get import history for current user.

**Query Parameters:**
- `page`: int (default 1)
- `pageSize`: int (default 20)
- `financialAccountId`: Guid (optional filter)
- `status`: ImportStatus (optional filter)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 42,
        "importDate": "2024-10-24T14:30:00Z",
        "originalFileName": "Transacciones Scotia.csv",
        "financialAccountName": "Scotia Checking",
        "bankProfileName": "Scotia Bank",
        "transactionsImported": 72,
        "duplicatesSkipped": 12,
        "errorsEncountered": 3,
        "status": "Completed",
        "canRollback": true
      }
    ],
    "totalCount": 15,
    "page": 1,
    "pageSize": 20
  }
}
```

#### POST /api/imports/{importHistoryId}/rollback

Rollback an import (soft-delete imported transactions).

**Response 200:**
```json
{
  "success": true,
  "data": {
    "importHistoryId": 42,
    "transactionsDeleted": 72,
    "message": "Import rolled back successfully"
  }
}
```

### 5.3 Category Rules API

#### GET /api/categoryrules

Get all category rules for current user.

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "ruleName": "Gas Stations",
      "categoryId": "uuid",
      "categoryName": "Transportation",
      "matchType": "Contains",
      "pattern": "ESSO",
      "priority": 80,
      "matchCount": 145,
      "lastMatchedDate": "2024-10-22T10:15:00Z",
      "isAutoGenerated": false,
      "isActive": true
    }
  ]
}
```

#### POST /api/categoryrules

Create new category rule.

**Request:**
```json
{
  "ruleName": "Supermarkets",
  "categoryId": "uuid",
  "matchType": "Contains",
  "pattern": "SUPERM",
  "isCaseSensitive": false,
  "priority": 75
}
```

#### PUT /api/categoryrules/{id}

Update existing rule.

#### DELETE /api/categoryrules/{id}

Deactivate rule (soft delete).

---

## 6. Core Algorithms

### 6.1 Automatic Bank Profile Detection

**Algorithm:** Signature-based pattern matching

**Steps:**

1. **Extract Signature Features**
2. **Score Each Bank Profile** with weighted features
3. **Return Top Match** with confidence

**Confidence Thresholds:**
- \> 0.85: Auto-select
- 0.60-0.85: Suggest with confirmation
- < 0.60: Manual selection required

### 6.2 Duplicate Detection

**Multi-Stage Pipeline:**

#### Stage 1: Exact Reference Match
```
IF ExternalReference == existing.ExternalReference
   AND ExternalReference IS NOT NULL
   → CONFIRMED DUPLICATE (skip)
```

#### Stage 2: Date + Amount Match
```
IF ABS(Date - existing.Date) <= 2 days
   AND Amount == existing.Amount
   → LIKELY DUPLICATE (warn)
```

#### Stage 3: Fuzzy Description Match
```
IF ABS(Date - existing.Date) <= 3 days
   AND ABS(Amount - existing.Amount) < 0.01
   AND LevenshteinSimilarity(Description, existing.Description) > 0.80
   → POSSIBLE DUPLICATE (flag)
```

### 6.3 Rule-Based Auto-Categorization

**Steps:**

1. Load active rules (sorted by priority DESC)
2. Evaluate rules in order using pattern matching
3. Calculate confidence score
4. Return first match or null

**Confidence Calculation:**
```
Base Score = 0.70

Bonuses:
+ 0.10 if MatchType == Exact
+ 0.05 if MatchCount > 50
+ 0.05 if Priority > 80
+ 0.10 if pattern matches multiple times

Max Score = 1.00
```

### 6.4 Automatic Rule Learning

**Trigger:** User manually categorizes 3+ transactions with similar keywords

**Process:**
1. Extract keywords from description
2. Count similar transactions
3. If count ≥ 3: Create auto-rule
4. Notify user

---

## 7. Performance Requirements

| Operation | Target | Max |
|-----------|--------|-----|
| Upload 1MB CSV | <2s | 5s |
| Parse 1000 rows | <3s | 8s |
| Duplicate detection (1000 rows) | <5s | 15s |
| Import confirmation (1000 rows) | <5s | 10s |

**Optimization Strategies:**
- Database indexes on ExternalTransactionId, Date, FinancialAccountId
- Cache category rules (5 min TTL)
- Batch inserts (500 rows)
- Parallel processing for duplicate detection

---

## 8. Security Considerations

**File Upload Security:**
- File size limit: 10MB
- MIME type validation
- Sanitize CSV content (prevent injection)
- Store outside web root
- Random filenames (GUID-based)

**Data Privacy:**
- Encrypt files at rest
- Delete after 30 days
- User isolation (cannot access others' imports)
- Audit log for file access

**Authorization:**
- JWT validation on all endpoints
- Users can only import to their own accounts
- System bank profiles read-only for non-admins

---

## 9. Testing Strategy

**Unit Tests:**
- CSV parser tests (all bank types)
- Duplicate detection tests
- Category rule matching tests
- Validation tests

**Integration Tests:**
- Full import flow end-to-end
- Rollback functionality
- Edge case handling

**Test Data:**
- apap_valid_dop.csv (50 rows, montos en DOP)
- apap_valid_usd.csv (50 rows, montos en USD)
- apap_with_duplicates.csv
- vimenca_valid.csv (actualizado con formato nuevo)
- large_file.csv (5000 rows)
- invalid_amounts.csv
- mixed_currency_apap.csv (DOP y USD en mismo archivo)

---

## 10. Future Enhancements

1. **Advanced ML Categorization** - Train models on user history
2. **OCR for Receipt Scanning** - Integrate Ollama vision models
3. **Direct Bank API Integration** - Plaid, Teller, Open Banking
4. **Scheduled Auto-Imports** - Cloud storage integration
5. **Split Transaction Handling** - Multiple categories per row
6. **Merchant Database** - Normalize merchant names

---

## 11. Success Criteria

✅ **Functional:**
- Import CSV from 2+ banks (APAP, Vimenca)
- **Currency selector working correctly** (mandatory field)
- Duplicate detection >95% accuracy
- Category rules auto-categorize >70% of transactions
- Import history with rollback
- Multi-currency support (APAP: auto-detect, Vimenca: user-specified)

✅ **Performance:**
- 1000 transactions in <5s
- Async processing for large files
- No UI blocking

✅ **Quality:**
- >80% test coverage
- <5% error rate in imports
- Clear error messages

---

**Document Version:** 1.0
**Created:** 2024-10-24
**Last Updated:** 2024-10-24
**Author:** Claude (Requirements Analyst)
**Status:** Ready for Implementation