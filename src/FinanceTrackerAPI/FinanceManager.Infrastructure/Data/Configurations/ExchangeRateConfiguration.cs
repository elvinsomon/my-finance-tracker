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
