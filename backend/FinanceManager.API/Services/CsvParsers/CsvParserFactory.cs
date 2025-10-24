namespace FinanceManager.API.Services.CsvParsers;

public class CsvParserFactory
{
    private readonly List<ICsvParserStrategy> _parsers;

    public CsvParserFactory()
    {
        _parsers = new List<ICsvParserStrategy>
        {
            new ApapCsvParser(),
            new VimencaCsvParser()
        };
    }

    public (ICsvParserStrategy parser, decimal confidence) DetectBank(Stream csvStream)
    {
        ICsvParserStrategy? bestParser = null;
        decimal bestConfidence = 0;

        foreach (var parser in _parsers)
        {
            var confidence = parser.CalculateConfidence(csvStream);
            csvStream.Position = 0; // Reset stream for next parser

            if (confidence > bestConfidence)
            {
                bestConfidence = confidence;
                bestParser = parser;
            }
        }

        // If no good match found, use APAP as default (most common)
        if (bestParser == null || bestConfidence < 0.5m)
        {
            return (_parsers[0], bestConfidence);
        }

        return (bestParser, bestConfidence);
    }

    public ICsvParserStrategy? CreateParser(string bankName)
    {
        return _parsers.FirstOrDefault(p =>
            p.BankName.Equals(bankName, StringComparison.OrdinalIgnoreCase));
    }

    public List<string> GetAvailableBanks()
    {
        return _parsers.Select(p => p.BankName).ToList();
    }
}
