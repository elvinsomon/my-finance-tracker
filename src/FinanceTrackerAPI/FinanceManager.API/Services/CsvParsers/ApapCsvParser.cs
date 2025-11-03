using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using FinanceManager.API.DTOs.Responses;

namespace FinanceManager.API.Services.CsvParsers;

public class ApapCsvParser : ICsvParserStrategy
{
    public string BankName => "APAP (Asociación Popular)";

    public List<ImportedTransactionDto> Parse(Stream csvStream, string userSelectedCurrency)
    {
        var transactions = new List<ImportedTransactionDto>();
        csvStream.Position = 0;

        using var reader = new StreamReader(csvStream, Encoding.UTF8, leaveOpen: true);

        // Skip header row
        var headerLine = reader.ReadLine();
        if (string.IsNullOrWhiteSpace(headerLine))
        {
            throw new InvalidDataException("CSV file is empty");
        }

        int rowNumber = 1;
        string? line;

        while ((line = reader.ReadLine()) != null)
        {
            rowNumber++;

            if (string.IsNullOrWhiteSpace(line))
                continue;

            var transaction = ParseApapLine(line, rowNumber, userSelectedCurrency);
            if (transaction != null)
            {
                transactions.Add(transaction);
            }
        }

        return transactions;
    }

    public decimal CalculateConfidence(Stream csvStream)
    {
        csvStream.Position = 0;
        using var reader = new StreamReader(csvStream, Encoding.UTF8, leaveOpen: true);

        var headerLine = reader.ReadLine();
        if (string.IsNullOrWhiteSpace(headerLine))
            return 0;

        // APAP signature: TRANSACCION,REFERENCIA,DESCRIPCION,MONTO
        var expectedHeaders = new[] { "TRANSACCION", "REFERENCIA", "DESCRIPCION", "MONTO" };
        var headerMatch = expectedHeaders.All(h => headerLine.Contains(h, StringComparison.OrdinalIgnoreCase));

        if (!headerMatch)
            return 0;

        // Check first data line for APAP format
        var firstLine = reader.ReadLine();
        if (string.IsNullOrWhiteSpace(firstLine))
            return 0.5m;

        // APAP amounts have format: "+ 123.45 DOP" or "- 123.45 USD"
        var amountPattern = @"[+-]\s*[\d,]+\.?\d*\s+(DOP|USD|EUR)";
        var hasApapAmountFormat = Regex.IsMatch(firstLine, amountPattern);

        return hasApapAmountFormat ? 0.95m : 0.5m;
    }

    private ImportedTransactionDto? ParseApapLine(string line, int rowNumber, string userSelectedCurrency)
    {
        var transaction = new ImportedTransactionDto
        {
            RowNumber = rowNumber,
            IsValid = true,
            ValidationErrors = new List<string>()
        };

        try
        {
            // Split CSV line (handle quoted fields)
            var fields = SplitCsvLine(line);

            if (fields.Length < 4)
            {
                transaction.IsValid = false;
                transaction.ValidationErrors.Add("Invalid CSV format: expected 4 columns");
                return transaction;
            }

            // Column 0: TRANSACCION (Date)
            if (!DateTime.TryParseExact(fields[0].Trim(), "dd/MM/yyyy",
                CultureInfo.InvariantCulture, DateTimeStyles.None, out var date))
            {
                transaction.IsValid = false;
                transaction.ValidationErrors.Add($"Invalid date format: {fields[0]}");
            }
            transaction.Date = date;

            // Column 1: REFERENCIA (External Reference)
            transaction.ExternalReference = fields[1].Trim();

            // Column 2: DESCRIPCION
            transaction.Description = fields[2].Trim();

            // Column 3: MONTO (Amount with currency)
            var amountField = fields[3].Trim();
            var (amount, currency, parseSuccess) = ParseApapAmount(amountField, userSelectedCurrency);

            if (!parseSuccess)
            {
                transaction.IsValid = false;
                transaction.ValidationErrors.Add($"Invalid amount format: {amountField}");
            }

            transaction.Amount = amount;
            transaction.Currency = currency;

            return transaction;
        }
        catch (Exception ex)
        {
            transaction.IsValid = false;
            transaction.ValidationErrors.Add($"Parse error: {ex.Message}");
            return transaction;
        }
    }

    private (decimal amount, string currency, bool success) ParseApapAmount(string amountField, string userSelectedCurrency)
    {
        // APAP format: "+ 364.51 DOP" or "- 700 DOP" or "+ 123.45 USD"
        var match = Regex.Match(amountField, @"([+-])\s*([\d,]+\.?\d*)\s+(DOP|USD|EUR)");

        if (!match.Success)
        {
            // Fallback: try to use user-selected currency
            var amountOnlyMatch = Regex.Match(amountField, @"([+-])\s*([\d,]+\.?\d*)");
            if (amountOnlyMatch.Success)
            {
                var sign = amountOnlyMatch.Groups[1].Value;
                var amountStr = amountOnlyMatch.Groups[2].Value.Replace(",", "");

                if (decimal.TryParse(amountStr, NumberStyles.Any, CultureInfo.InvariantCulture, out var amount))
                {
                    if (sign == "-")
                        amount = -amount;

                    return (amount, userSelectedCurrency, true);
                }
            }

            return (0, userSelectedCurrency, false);
        }

        var signMatch = match.Groups[1].Value;
        var amountString = match.Groups[2].Value.Replace(",", "");
        var currencyMatch = match.Groups[3].Value;

        if (!decimal.TryParse(amountString, NumberStyles.Any, CultureInfo.InvariantCulture, out var parsedAmount))
        {
            return (0, currencyMatch, false);
        }

        if (signMatch == "-")
            parsedAmount = -parsedAmount;

        return (parsedAmount, currencyMatch, true);
    }

    private string[] SplitCsvLine(string line)
    {
        var fields = new List<string>();
        var currentField = new StringBuilder();
        bool inQuotes = false;

        for (int i = 0; i < line.Length; i++)
        {
            char c = line[i];

            if (c == '"')
            {
                inQuotes = !inQuotes;
            }
            else if (c == ',' && !inQuotes)
            {
                fields.Add(currentField.ToString());
                currentField.Clear();
            }
            else
            {
                currentField.Append(c);
            }
        }

        fields.Add(currentField.ToString());
        return fields.ToArray();
    }
}
