using FinanceManager.Core.Entities;
using FinanceManager.Core.Enums;
using FinanceManager.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FinanceManager.Infrastructure.Seeders;

public static class DataSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        // Check if categories already exist
        var categoriesExist = await context.Categories.AnyAsync(c => c.IsSystem);

        if (!categoriesExist)
        {
            await SeedCategoriesAsync(context);
        }

        // Seed category rules if not already seeded
        await SeedCategoryRulesForSystemUserAsync(context);
    }

    private static async Task SeedCategoriesAsync(ApplicationDbContext context)
    {
        var categories = new List<Category>
        {
            // Income categories
            new Category
            {
                Id = Guid.NewGuid(),
                UserId = null,
                Name = "Salario",
                Type = TransactionType.Income,
                IsSystem = true,
                Icon = "💼",
                Color = "#10b981",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new Category
            {
                Id = Guid.NewGuid(),
                UserId = null,
                Name = "Freelance",
                Type = TransactionType.Income,
                IsSystem = true,
                Icon = "💻",
                Color = "#3b82f6",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new Category
            {
                Id = Guid.NewGuid(),
                UserId = null,
                Name = "Inversiones",
                Type = TransactionType.Income,
                IsSystem = true,
                Icon = "📈",
                Color = "#8b5cf6",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new Category
            {
                Id = Guid.NewGuid(),
                UserId = null,
                Name = "Otros Ingresos",
                Type = TransactionType.Income,
                IsSystem = true,
                Icon = "➕",
                Color = "#6b7280",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            // Expense categories
            new Category
            {
                Id = Guid.NewGuid(),
                UserId = null,
                Name = "Alimentación",
                Type = TransactionType.Expense,
                IsSystem = true,
                Icon = "🍽️",
                Color = "#f97316",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new Category
            {
                Id = Guid.NewGuid(),
                UserId = null,
                Name = "Transporte",
                Type = TransactionType.Expense,
                IsSystem = true,
                Icon = "🚗",
                Color = "#06b6d4",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new Category
            {
                Id = Guid.NewGuid(),
                UserId = null,
                Name = "Vivienda",
                Type = TransactionType.Expense,
                IsSystem = true,
                Icon = "🏠",
                Color = "#8b5cf6",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new Category
            {
                Id = Guid.NewGuid(),
                UserId = null,
                Name = "Salud",
                Type = TransactionType.Expense,
                IsSystem = true,
                Icon = "🏥",
                Color = "#ef4444",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new Category
            {
                Id = Guid.NewGuid(),
                UserId = null,
                Name = "Entretenimiento",
                Type = TransactionType.Expense,
                IsSystem = true,
                Icon = "🎉",
                Color = "#ec4899",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new Category
            {
                Id = Guid.NewGuid(),
                UserId = null,
                Name = "Educación",
                Type = TransactionType.Expense,
                IsSystem = true,
                Icon = "📚",
                Color = "#f59e0b",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new Category
            {
                Id = Guid.NewGuid(),
                UserId = null,
                Name = "Servicios",
                Type = TransactionType.Expense,
                IsSystem = true,
                Icon = "🔧",
                Color = "#14b8a6",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new Category
            {
                Id = Guid.NewGuid(),
                UserId = null,
                Name = "Compras",
                Type = TransactionType.Expense,
                IsSystem = true,
                Icon = "🛍️",
                Color = "#a855f7",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new Category
            {
                Id = Guid.NewGuid(),
                UserId = null,
                Name = "Otros Gastos",
                Type = TransactionType.Expense,
                IsSystem = true,
                Icon = "➖",
                Color = "#6b7280",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            }
        };

        await context.Categories.AddRangeAsync(categories);
        await context.SaveChangesAsync();
    }

    private static async Task SeedCategoryRulesForSystemUserAsync(ApplicationDbContext context)
    {
        // Use a fixed system user ID for predefined rules
        // This allows rules to be shared across all users without creating a real system user
        var systemUserId = Guid.Parse("b47b33b5-11d0-4d55-a012-be51caa42a6f");

        // Seed category rules
        await CategoryRuleSeeder.SeedCategoryRulesAsync(context, systemUserId);
    }
}
