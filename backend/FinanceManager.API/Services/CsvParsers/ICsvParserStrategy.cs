using FinanceManager.API.DTOs.Responses;

namespace FinanceManager.API.Services.CsvParsers;

public interface ICsvParserStrategy
{
    string BankName { get; }
    List<ImportedTransactionDto> Parse(Stream csvStream, string userSelectedCurrency);
    decimal CalculateConfidence(Stream csvStream);
}
