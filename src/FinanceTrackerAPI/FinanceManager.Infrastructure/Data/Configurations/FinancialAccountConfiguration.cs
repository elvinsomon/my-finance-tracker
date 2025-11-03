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
