using System.Globalization;
using System.Text;
using FinanceManager.API.DTOs.Responses;

namespace FinanceManager.API.Services.CsvParsers;

public class VimencaCsvParser : ICsvParserStrategy
{
    public string BankName => "Banco Vimenca";

    public List<ImportedTransactionDto> Parse(Stream csvStream, string userSelectedCurrency)
    {
        var transactions = new List<ImportedTransactionDto>();
        csvStream.Position = 0;

        using var reader = new StreamReader(csvStream, Encoding.UTF8, leaveOpen: true);

        // Skip first 3 rows (metadata header rows)
        for (int i = 0; i < 3; i++)
        {
            reader.ReadLine();
        }

        // Read actual header row (row 4)
        var headerLine = reader.ReadLine();
        if (string.IsNullOrWhiteSpace(headerLine))
        {
            throw new InvalidDataException("CSV file header not found");
        }

        int rowNumber = 4; // Start at 4 because we skipped 3 rows
        string? line;

        while ((line = reader.ReadLine()) != null)
        {
            rowNumber++;

            if (string.IsNullOrWhiteSpace(line))
                continue;

            var transaction = ParseVimencaLine(line, rowNumber, userSelectedCurrency);
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

        // Read first 3 lines (metadata)
        var line1 = reader.ReadLine();
        var line2 = reader.ReadLine();
        var line3 = reader.ReadLine();

        if (string.IsNullOrWhiteSpace(line1) || string.IsNullOrWhiteSpace(line2) || string.IsNullOrWhiteSpace(line3))
            return 0;

        // Vimenca signature: "Cliente:", "No. Tarjeta:", "Estado de Cuenta al"
        bool hasClienteLine = line1.Contains("Cliente:", StringComparison.OrdinalIgnoreCase);
        bool hasCardLine = line2.Contains("No. Tarjeta:", StringComparison.OrdinalIgnoreCase);
        bool hasStatementLine = line3.Contains("Estado de Cuenta al", StringComparison.OrdinalIgnoreCase);

        if (!hasClienteLine || !hasCardLine || !hasStatementLine)
            return 0;

        // Check header line
        var headerLine = reader.ReadLine();
        if (string.IsNullOrWhiteSpace(headerLine))
            return 0.5m;

        // Vimenca expected headers
        var expectedHeaders = new[] { "Fecha Transacci", "Fecha Posteo", "No. Referencia", "Concepto", "Monto" };
        var headerMatch = expectedHeaders.All(h => headerLine.Contains(h, StringComparison.OrdinalIgnoreCase));

        return headerMatch ? 0.90m : 0.3m;
    }

    private ImportedTransactionDto? ParseVimencaLine(string line, int rowNumber, string userSelectedCurrency)
    {
        var transaction = new ImportedTransactionDto
        {
            RowNumber = rowNumber,
            IsValid = true,
            ValidationErrors = new List<string>(),
            Currency = userSelectedCurrency // Vimenca doesn't include currency in file
        };

        try
        {
            // Split CSV line (handle quoted fields)
            var fields = SplitCsvLine(line);

            if (fields.Length < 5)
            {
                transaction.IsValid = false;
                transaction.ValidationErrors.Add("Invalid CSV format: expected 5 columns");
                return transaction;
            }

            // Column 0: Fecha Transacción
            var dateField = fields[0].Trim().Trim('"');
            if (!DateTime.TryParseExact(dateField, "dd/MM/yyyy",
                CultureInfo.InvariantCulture, DateTimeStyles.None, out var date))
            {
                transaction.IsValid = false;
                transaction.ValidationErrors.Add($"Invalid date format: {dateField}");
            }
            transaction.Date = date;

            // Column 2: No. Referencia
            transaction.ExternalReference = fields[2].Trim().Trim('"');

            // Column 3: Concepto (Description)
            transaction.Description = fields[3].Trim().Trim('"');

            // Column 4: Monto (Amount - NO currency in Vimenca file)
            var amountField = fields[4].Trim().Trim('"');

            if (!decimal.TryParse(amountField, NumberStyles.Any, CultureInfo.InvariantCulture, out var amount))
            {
                transaction.IsValid = false;
                transaction.ValidationErrors.Add($"Invalid amount format: {amountField}");
            }

            // Vimenca uses positive numbers for debits - need to determine if it's income or expense
            // For now, we'll keep the sign as-is and let the user correct if needed
            // Typically credit card statements show purchases as positive and payments as negative
            transaction.Amount = amount;

            return transaction;
        }
        catch (Exception ex)
        {
            transaction.IsValid = false;
            transaction.ValidationErrors.Add($"Parse error: {ex.Message}");
            return transaction;
        }
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
