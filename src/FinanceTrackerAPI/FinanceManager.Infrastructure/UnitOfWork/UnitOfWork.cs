using FinanceManager.Core.Interfaces.Repositories;
using FinanceManager.Infrastructure.Data;
using FinanceManager.Infrastructure.Repositories;

namespace FinanceManager.Infrastructure.UnitOfWork;

public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;
    private IUserRepository? _users;
    private ITransactionRepository? _transactions;
    private ICategoryRepository? _categories;
    private IBudgetRepository? _budgets;
    private IFinancialAccountRepository? _financialAccounts;
    private IExchangeRateRepository? _exchangeRates;
    private ISavingsGoalRepository? _savingsGoals;
    private IImportHistoryRepository? _importHistories;
    private ICategoryRuleRepository? _categoryRules;

    public UnitOfWork(ApplicationDbContext context)
    {
        _context = context;
    }

    public IUserRepository Users =>
        _users ??= new UserRepository(_context);

    public ITransactionRepository Transactions =>
        _transactions ??= new TransactionRepository(_context);

    public ICategoryRepository Categories =>
        _categories ??= new CategoryRepository(_context);

    public IBudgetRepository Budgets =>
        _budgets ??= new BudgetRepository(_context);

    public IFinancialAccountRepository FinancialAccounts =>
        _financialAccounts ??= new FinancialAccountRepository(_context);

    public IExchangeRateRepository ExchangeRates =>
        _exchangeRates ??= new ExchangeRateRepository(_context);

    public ISavingsGoalRepository SavingsGoals =>
        _savingsGoals ??= new SavingsGoalRepository(_context);

    public IImportHistoryRepository ImportHistories =>
        _importHistories ??= new ImportHistoryRepository(_context);

    public ICategoryRuleRepository CategoryRules =>
        _categoryRules ??= new CategoryRuleRepository(_context);

    public async Task<int> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync();
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}
