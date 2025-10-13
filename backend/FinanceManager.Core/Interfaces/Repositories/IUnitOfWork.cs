namespace FinanceManager.Core.Interfaces.Repositories;

public interface IUnitOfWork : IDisposable
{
    IUserRepository Users { get; }
    ITransactionRepository Transactions { get; }
    ICategoryRepository Categories { get; }
    IBudgetRepository Budgets { get; }
    IFinancialAccountRepository FinancialAccounts { get; }
    IExchangeRateRepository ExchangeRates { get; }

    Task<int> SaveChangesAsync();
}
