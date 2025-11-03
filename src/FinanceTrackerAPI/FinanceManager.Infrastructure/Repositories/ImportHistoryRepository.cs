using Microsoft.EntityFrameworkCore;
using FinanceManager.Core.Entities;
using FinanceManager.Core.Enums;
using FinanceManager.Core.Interfaces.Repositories;
using FinanceManager.Infrastructure.Data;

namespace FinanceManager.Infrastructure.Repositories;

public class ImportHistoryRepository : IImportHistoryRepository
{
    private readonly ApplicationDbContext _context;

    public ImportHistoryRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ImportHistory?> GetByIdAsync(int id)
    {
        return await _context.ImportHistories
            .Include(ih => ih.User)
            .Include(ih => ih.FinancialAccount)
            .FirstOrDefaultAsync(ih => ih.Id == id);
    }

    public async Task<IEnumerable<ImportHistory>> GetAllByUserIdAsync(Guid userId)
    {
        return await _context.ImportHistories
            .Where(ih => ih.UserId == userId)
            .Include(ih => ih.FinancialAccount)
            .OrderByDescending(ih => ih.ImportDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<ImportHistory>> GetByUserIdPaginatedAsync(Guid userId, int page, int pageSize)
    {
        return await _context.ImportHistories
            .Where(ih => ih.UserId == userId)
            .Include(ih => ih.FinancialAccount)
            .OrderByDescending(ih => ih.ImportDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<IEnumerable<ImportHistory>> GetByFinancialAccountIdAsync(Guid financialAccountId)
    {
        return await _context.ImportHistories
            .Where(ih => ih.FinancialAccountId == financialAccountId)
            .Include(ih => ih.User)
            .Include(ih => ih.FinancialAccount)
            .OrderByDescending(ih => ih.ImportDate)
            .ToListAsync();
    }

    public async Task<ImportHistory> AddAsync(ImportHistory importHistory)
    {
        await _context.ImportHistories.AddAsync(importHistory);
        return importHistory;
    }

    public Task UpdateAsync(ImportHistory importHistory)
    {
        _context.ImportHistories.Update(importHistory);
        return Task.CompletedTask;
    }

    public async Task<int> CountByUserIdAsync(Guid userId)
    {
        return await _context.ImportHistories
            .Where(ih => ih.UserId == userId)
            .CountAsync();
    }
}
