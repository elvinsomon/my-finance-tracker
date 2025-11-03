using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using FinanceManager.Core.Entities;
using FinanceManager.Core.Enums;

namespace FinanceManager.Infrastructure.Data.Configurations;

public class ImportHistoryConfiguration : IEntityTypeConfiguration<ImportHistory>
{
    public void Configure(EntityTypeBuilder<ImportHistory> builder)
    {
        builder.ToTable("ImportHistory");

        builder.HasKey(ih => ih.Id);

        builder.Property(ih => ih.OriginalFileName)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(ih => ih.StoredFileName)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(ih => ih.Currency)
            .IsRequired()
            .HasMaxLength(3);

        builder.Property(ih => ih.Status)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(ih => ih.ErrorDetails)
            .HasColumnType("text");

        // Foreign Keys
        builder.HasOne(ih => ih.User)
            .WithMany()
            .HasForeignKey(ih => ih.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(ih => ih.FinancialAccount)
            .WithMany()
            .HasForeignKey(ih => ih.FinancialAccountId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(ih => ih.UserId);
        builder.HasIndex(ih => ih.ImportDate);
        builder.HasIndex(ih => new { ih.UserId, ih.ImportDate });
    }
}
