using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;
using FinanceManager.Core.Entities;
using FinanceManager.Core.Enums;
using FinanceManager.Core.Exceptions;
using FinanceManager.Core.Interfaces.Repositories;
using FinanceManager.API.DTOs.Responses;
using FinanceManager.API.Services.CsvParsers;

namespace FinanceManager.API.Services;

public class ImportService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMemoryCache _memoryCache;
    private readonly DuplicateDetectionService _duplicateDetectionService;
    private readonly CategoryRuleEngine _categoryRuleEngine;
    private readonly string _uploadBasePath;
    private const long MaxFileSizeBytes = 10 * 1024 * 1024; // 10MB
    private const int PreviewRowCount = 20;

    public ImportService(
        IUnitOfWork unitOfWork,
        IMemoryCache memoryCache,
        DuplicateDetectionService duplicateDetectionService,
        CategoryRuleEngine categoryRuleEngine,
        IConfiguration configuration)
    {
        _unitOfWork = unitOfWork;
        _memoryCache = memoryCache;
        _duplicateDetectionService = duplicateDetectionService;
        _categoryRuleEngine = categoryRuleEngine;
        _uploadBasePath = configuration["FileStorage:ImportsPath"] ?? "/uploads/imports";
    }

    public async Task<UploadCsvResponse> UploadCsvAsync(IFormFile file, Guid financialAccountId, string currency, Guid userId)
    {
        // 1. Validate file
        ValidateFile(file);

        // 2. Verify financial account exists and belongs to user
        var account = await _unitOfWork.FinancialAccounts.GetByIdAsync(financialAccountId);
        if (account == null || account.UserId != userId)
        {
            throw new NotFoundException("Financial account not found");
        }

        // 3. Save file to disk
        var uploadId = Guid.NewGuid();
        var storedFileName = await SaveFileAsync(file, userId, uploadId);

        // 4. Detect bank and parse preview
        UploadCsvResponse response;

        using (var stream = new FileStream(GetFilePath(userId, storedFileName), FileMode.Open, FileAccess.Read))
        {
            var factory = new CsvParserFactory();
            var (parser, confidence) = factory.DetectBank(stream);

            stream.Position = 0;
            var allTransactions = parser.Parse(stream, currency);

            // Determine if currency was detected from file or user-provided
            bool currencyDetected = parser.BankName.Contains("APAP", StringComparison.OrdinalIgnoreCase);

            // Apply duplicate detection and auto-categorization to preview transactions
            var previewTransactions = allTransactions.Take(PreviewRowCount).ToList();
            foreach (var transaction in previewTransactions)
            {
                // Apply duplicate detection
                var (dupStatus, existingId, dupReason) = await _duplicateDetectionService
                    .CheckDuplicateAsync(transaction, financialAccountId, userId);

                transaction.DuplicateStatus = dupStatus;
                transaction.ExistingTransactionId = existingId;
                transaction.DuplicateReason = dupReason;

                // Apply auto-categorization
                var (categoryId, categoryName, categoryConfidence, ruleName) = await _categoryRuleEngine
                    .SuggestCategoryAsync(transaction.Description, userId);

                transaction.SuggestedCategoryId = categoryId;
                transaction.SuggestedCategoryName = categoryName;
                transaction.ConfidenceScore = categoryConfidence;
                transaction.MatchedRuleName = ruleName;
            }

            response = new UploadCsvResponse
            {
                UploadId = uploadId,
                DetectedBank = parser.BankName,
                Confidence = confidence,
                Currency = currency,
                CurrencyDetected = currencyDetected,
                FileInfo = new FileInfoDto
                {
                    FileName = file.FileName,
                    SizeBytes = file.Length,
                    RowCount = allTransactions.Count,
                    Encoding = "UTF-8"
                },
                Preview = previewTransactions
            };
        }

        // 5. Cache upload data for later confirmation
        var cacheData = new UploadCacheData
        {
            UploadId = uploadId,
            UserId = userId,
            FinancialAccountId = financialAccountId,
            Currency = currency,
            StoredFileName = storedFileName,
            OriginalFileName = file.FileName,
            FileSizeBytes = file.Length,
            DetectedBankName = response.DetectedBank
        };

        _memoryCache.Set($"upload_{uploadId}", cacheData, TimeSpan.FromHours(1));

        return response;
    }

    public async Task<List<ImportedTransactionDto>> GetPreviewAsync(Guid uploadId, Guid userId)
    {
        var cacheKey = $"upload_{uploadId}";
        if (!_memoryCache.TryGetValue<UploadCacheData>(cacheKey, out var cacheData) || cacheData == null)
        {
            throw new NotFoundException("Upload session not found or expired");
        }

        if (cacheData.UserId != userId)
        {
            throw new UnauthorizedException("Unauthorized access to upload");
        }

        var filePath = GetFilePath(userId, cacheData.StoredFileName);
        if (!File.Exists(filePath))
        {
            throw new NotFoundException("Uploaded file not found");
        }

        using var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read);
        var factory = new CsvParserFactory();
        var parser = factory.CreateParser(cacheData.DetectedBankName);

        if (parser == null)
        {
            throw new BusinessException("Unable to parse file with detected bank format");
        }

        return parser.Parse(stream, cacheData.Currency);
    }

    public async Task<ConfirmImportResponse> ConfirmImportAsync(Guid uploadId, Dictionary<int, Guid> categoryAssignments, Guid userId)
    {
        // 1. Retrieve cached upload data
        var cacheKey = $"upload_{uploadId}";
        if (!_memoryCache.TryGetValue<UploadCacheData>(cacheKey, out var cacheData) || cacheData == null)
        {
            throw new NotFoundException("Upload session not found or expired");
        }

        if (cacheData.UserId != userId)
        {
            throw new UnauthorizedException("Unauthorized access to upload");
        }

        // 2. Parse all transactions
        var filePath = GetFilePath(userId, cacheData.StoredFileName);
        if (!File.Exists(filePath))
        {
            throw new NotFoundException("Uploaded file not found");
        }

        List<ImportedTransactionDto> parsedTransactions;
        using (var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read))
        {
            var factory = new CsvParserFactory();
            var parser = factory.CreateParser(cacheData.DetectedBankName);

            if (parser == null)
            {
                throw new BusinessException("Unable to parse file with detected bank format");
            }

            parsedTransactions = parser.Parse(stream, cacheData.Currency);
        }

        // 3. Filter only valid transactions
        var validTransactions = parsedTransactions.Where(t => t.IsValid).ToList();

        // 4. Create ImportHistory record
        var importHistory = new ImportHistory
        {
            UserId = userId,
            FinancialAccountId = cacheData.FinancialAccountId,
            OriginalFileName = cacheData.OriginalFileName,
            StoredFileName = cacheData.StoredFileName,
            FileSizeBytes = cacheData.FileSizeBytes,
            Currency = cacheData.Currency,
            ImportDate = DateTime.UtcNow,
            TotalRowsProcessed = parsedTransactions.Count,
            TransactionsImported = 0, // Will be updated below
            ErrorsEncountered = parsedTransactions.Count - validTransactions.Count,
            ErrorDetails = JsonSerializer.Serialize(parsedTransactions.Where(t => !t.IsValid).Select(t => new
            {
                t.RowNumber,
                t.ValidationErrors
            })),
            Status = ImportStatus.Processing
        };

        await _unitOfWork.ImportHistories.AddAsync(importHistory);
        await _unitOfWork.SaveChangesAsync(); // Save to get ImportHistory.Id

        // 5. Get default category for uncategorized transactions
        var categories = await _unitOfWork.Categories.GetByUserIdAsync(userId);
        var defaultCategory = categories.FirstOrDefault(c => c.Name.Contains("Sin categoría", StringComparison.OrdinalIgnoreCase))
                           ?? categories.FirstOrDefault();

        if (defaultCategory == null)
        {
            throw new BusinessException("No categories found for user");
        }

        // 6. Create Transaction entities
        var importedTransactionIds = new List<Guid>();
        var account = await _unitOfWork.FinancialAccounts.GetByIdAsync(cacheData.FinancialAccountId);

        foreach (var parsed in validTransactions)
        {
            // Determine category: from user assignments or default
            var categoryId = categoryAssignments.ContainsKey(parsed.RowNumber)
                ? categoryAssignments[parsed.RowNumber]
                : defaultCategory.Id;

            var transaction = new Transaction
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                AccountId = cacheData.FinancialAccountId,
                CategoryId = categoryId,
                Type = parsed.Amount >= 0 ? TransactionType.Income : TransactionType.Expense,
                Amount = Math.Abs(parsed.Amount),
                Currency = parsed.Currency,
                ExchangeRate = 1, // TODO: Fetch exchange rate if currency differs from account
                AmountInBaseCurrency = Math.Abs(parsed.Amount), // TODO: Apply exchange rate
                Date = parsed.Date,
                Description = parsed.Description,
                Status = TransactionStatus.Completed,
                ImportHistoryId = importHistory.Id,
                ExternalTransactionId = parsed.ExternalReference,
                IsImported = true
            };

            await _unitOfWork.Transactions.AddAsync(transaction);
            importedTransactionIds.Add(transaction.Id);
        }

        // 7. Update ImportHistory status
        importHistory.TransactionsImported = validTransactions.Count;
        importHistory.Status = ImportStatus.Completed;
        await _unitOfWork.ImportHistories.UpdateAsync(importHistory);

        // 8. Update account balance
        var totalAmount = validTransactions.Sum(t => t.Amount);
        account!.CurrentBalance += totalAmount;
        await _unitOfWork.FinancialAccounts.UpdateAsync(account);

        // 9. Save all changes
        await _unitOfWork.SaveChangesAsync();

        // 10. Clear cache
        _memoryCache.Remove(cacheKey);

        return new ConfirmImportResponse
        {
            ImportHistoryId = importHistory.Id,
            TransactionsImported = validTransactions.Count,
            ErrorsSkipped = parsedTransactions.Count - validTransactions.Count,
            ImportedTransactionIds = importedTransactionIds
        };
    }

    public async Task<(List<ImportHistoryResponse> items, int totalCount)> GetHistoryAsync(Guid userId, int page, int pageSize)
    {
        var histories = await _unitOfWork.ImportHistories.GetByUserIdPaginatedAsync(userId, page, pageSize);
        var totalCount = await _unitOfWork.ImportHistories.CountByUserIdAsync(userId);

        var response = histories.Select(h => new ImportHistoryResponse
        {
            Id = h.Id,
            ImportDate = h.ImportDate,
            OriginalFileName = h.OriginalFileName,
            FinancialAccountName = h.FinancialAccount.Name,
            Currency = h.Currency,
            TransactionsImported = h.TransactionsImported,
            ErrorsEncountered = h.ErrorsEncountered,
            Status = h.Status.ToString()
        }).ToList();

        return (response, totalCount);
    }

    private void ValidateFile(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            throw new ValidationException("File is required");
        }

        if (file.Length > MaxFileSizeBytes)
        {
            throw new ValidationException($"File size exceeds maximum limit of {MaxFileSizeBytes / 1024 / 1024}MB");
        }

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (extension != ".csv")
        {
            throw new ValidationException("Only CSV files are supported");
        }
    }

    private async Task<string> SaveFileAsync(IFormFile file, Guid userId, Guid uploadId)
    {
        var now = DateTime.UtcNow;
        var userDir = Path.Combine(_uploadBasePath, userId.ToString(), now.Year.ToString(), now.Month.ToString("D2"));

        Directory.CreateDirectory(userDir);

        var storedFileName = $"{uploadId}_original.csv";
        var filePath = Path.Combine(userDir, storedFileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        return storedFileName;
    }

    private string GetFilePath(Guid userId, string storedFileName)
    {
        // Extract year and month from stored filename (if needed) or use current date
        var now = DateTime.UtcNow;
        return Path.Combine(_uploadBasePath, userId.ToString(), now.Year.ToString(), now.Month.ToString("D2"), storedFileName);
    }
}

// Internal cache data class
public class UploadCacheData
{
    public Guid UploadId { get; set; }
    public Guid UserId { get; set; }
    public Guid FinancialAccountId { get; set; }
    public string Currency { get; set; } = string.Empty;
    public string StoredFileName { get; set; } = string.Empty;
    public string OriginalFileName { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public string DetectedBankName { get; set; } = string.Empty;
}
