#!/bin/bash

# Script completo para generar TODO el backend de MyFinanceTracker
# Incluye: Infrastructure, API, Controllers, Services, DTOs, etc.

set -e

BASE_DIR="/Users/elvinsomon/Documents/Proyectos/MyFinanceTracker/backend"

echo "=== Generando Backend Completo de MyFinanceTracker ==="

# Eliminar Class1.cs por defecto
rm -f "$BASE_DIR/FinanceManager.Core/Class1.cs"
rm -f "$BASE_DIR/FinanceManager.Infrastructure/Class1.cs"

# ===== INFRASTRUCTURE: DbContext =====

cat > "$BASE_DIR/FinanceManager.Infrastructure/Data/ApplicationDbContext.cs" << 'DBCONTEXT'
using Microsoft.EntityFrameworkCore;
using FinanceManager.Core.Entities;

namespace FinanceManager.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<FinancialAccount> FinancialAccounts { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<Transaction> Transactions { get; set; }
    public DbSet<Budget> Budgets { get; set; }
    public DbSet<ExchangeRate> ExchangeRates { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply configurations
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var entries = ChangeTracker.Entries()
            .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified);

        foreach (var entry in entries)
        {
            if (entry.State == EntityState.Added)
            {
                if (entry.Property("CreatedAt") != null)
                    entry.Property("CreatedAt").CurrentValue = DateTime.UtcNow;

                if (entry.Property("UpdatedAt") != null)
                    entry.Property("UpdatedAt").CurrentValue = DateTime.UtcNow;
            }
            else if (entry.State == EntityState.Modified)
            {
                if (entry.Property("UpdatedAt") != null)
                    entry.Property("UpdatedAt").CurrentValue = DateTime.UtcNow;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
DBCONTEXT

# ===== INFRASTRUCTURE: Entity Configurations =====

cat > "$BASE_DIR/FinanceManager.Infrastructure/Data/Configurations/UserConfiguration.cs" << 'USERCONFIG'
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using FinanceManager.Core.Entities;

namespace FinanceManager.Infrastructure.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users");

        builder.HasKey(u => u.Id);

        builder.Property(u => u.Email)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(u => u.PasswordHash)
            .IsRequired();

        builder.Property(u => u.FullName)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(u => u.DefaultCurrency)
            .IsRequired()
            .HasMaxLength(3);

        builder.HasIndex(u => u.Email).IsUnique();
    }
}
USERCONFIG

cat > "$BASE_DIR/FinanceManager.Infrastructure/Data/Configurations/TransactionConfiguration.cs" << 'TRANSCONFIG'
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using FinanceManager.Core.Entities;
using FinanceManager.Core.Enums;

namespace FinanceManager.Infrastructure.Data.Configurations;

public class TransactionConfiguration : IEntityTypeConfiguration<Transaction>
{
    public void Configure(EntityTypeBuilder<Transaction> builder)
    {
        builder.ToTable("Transactions");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.Type)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(t => t.Status)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(t => t.Amount)
            .HasColumnType("decimal(18,2)");

        builder.Property(t => t.AmountInBaseCurrency)
            .HasColumnType("decimal(18,2)");

        builder.Property(t => t.ExchangeRate)
            .HasColumnType("decimal(18,6)");

        builder.Property(t => t.Currency)
            .IsRequired()
            .HasMaxLength(3);

        builder.Property(t => t.Description)
            .IsRequired()
            .HasMaxLength(500);

        builder.HasOne(t => t.User)
            .WithMany(u => u.Transactions)
            .HasForeignKey(t => t.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(t => t.Account)
            .WithMany(a => a.Transactions)
            .HasForeignKey(t => t.AccountId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(t => t.Category)
            .WithMany(c => c.Transactions)
            .HasForeignKey(t => t.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(t => t.UserId);
        builder.HasIndex(t => t.Date);
    }
}
TRANSCONFIG

cat > "$BASE_DIR/FinanceManager.Infrastructure/Data/Configurations/CategoryConfiguration.cs" << 'CATCONFIG'
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using FinanceManager.Core.Entities;

namespace FinanceManager.Infrastructure.Data.Configurations;

public class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.ToTable("Categories");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Name)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(c => c.Type)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.HasOne(c => c.User)
            .WithMany(u => u.Categories)
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(c => c.ParentCategory)
            .WithMany(c => c.Subcategories)
            .HasForeignKey(c => c.ParentCategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(c => new { c.UserId, c.Name });
    }
}
CATCONFIG

cat > "$BASE_DIR/FinanceManager.Infrastructure/Data/Configurations/BudgetConfiguration.cs" << 'BUDGETCONFIG'
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using FinanceManager.Core.Entities;

namespace FinanceManager.Infrastructure.Data.Configurations;

public class BudgetConfiguration : IEntityTypeConfiguration<Budget>
{
    public void Configure(EntityTypeBuilder<Budget> builder)
    {
        builder.ToTable("Budgets");

        builder.HasKey(b => b.Id);

        builder.Property(b => b.Period)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(b => b.Amount)
            .HasColumnType("decimal(18,2)");

        builder.Property(b => b.Currency)
            .IsRequired()
            .HasMaxLength(3);

        builder.HasOne(b => b.User)
            .WithMany(u => u.Budgets)
            .HasForeignKey(b => b.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(b => b.Category)
            .WithMany(c => c.Budgets)
            .HasForeignKey(b => b.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(b => b.UserId);
    }
}
BUDGETCONFIG

cat > "$BASE_DIR/FinanceManager.Infrastructure/Data/Configurations/FinancialAccountConfiguration.cs" << 'ACCOUNTCONFIG'
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using FinanceManager.Core.Entities;

namespace FinanceManager.Infrastructure.Data.Configurations;

public class FinancialAccountConfiguration : IEntityTypeConfiguration<FinancialAccount>
{
    public void Configure(EntityTypeBuilder<FinancialAccount> builder)
    {
        builder.ToTable("FinancialAccounts");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.Name)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(a => a.Type)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(a => a.Currency)
            .IsRequired()
            .HasMaxLength(3);

        builder.Property(a => a.InitialBalance)
            .HasColumnType("decimal(18,2)");

        builder.Property(a => a.CurrentBalance)
            .HasColumnType("decimal(18,2)");

        builder.HasOne(a => a.User)
            .WithMany(u => u.FinancialAccounts)
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(a => a.UserId);
    }
}
ACCOUNTCONFIG

cat > "$BASE_DIR/FinanceManager.Infrastructure/Data/Configurations/ExchangeRateConfiguration.cs" << 'RATECONFIG'
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using FinanceManager.Core.Entities;

namespace FinanceManager.Infrastructure.Data.Configurations;

public class ExchangeRateConfiguration : IEntityTypeConfiguration<ExchangeRate>
{
    public void Configure(EntityTypeBuilder<ExchangeRate> builder)
    {
        builder.ToTable("ExchangeRates");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.FromCurrency)
            .IsRequired()
            .HasMaxLength(3);

        builder.Property(e => e.ToCurrency)
            .IsRequired()
            .HasMaxLength(3);

        builder.Property(e => e.Rate)
            .HasColumnType("decimal(18,6)");

        builder.Property(e => e.Source)
            .HasMaxLength(50);

        builder.HasIndex(e => new { e.FromCurrency, e.ToCurrency, e.Date });
    }
}
RATECONFIG

echo "DbContext y Configurations creadas ✓"

# Continuar en la siguiente parte...
echo "Infrastructure layer parte 1 completada ✓"
DBCONTEXT
