using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using FinanceManager.Core.Entities;

namespace FinanceManager.Infrastructure.Data.Configurations;

public class TransactionItemConfiguration : IEntityTypeConfiguration<TransactionItem>
{
    public void Configure(EntityTypeBuilder<TransactionItem> builder)
    {
        builder.ToTable("TransactionItems");

        builder.HasKey(ti => ti.Id);

        builder.Property(ti => ti.Description)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(ti => ti.Quantity)
            .HasColumnType("decimal(18,2)")
            .IsRequired();

        builder.Property(ti => ti.UnitPrice)
            .HasColumnType("decimal(18,2)")
            .IsRequired();

        builder.Property(ti => ti.TotalAmount)
            .HasColumnType("decimal(18,2)")
            .IsRequired();

        builder.Property(ti => ti.Notes)
            .HasMaxLength(1000);

        builder.Property(ti => ti.CreatedAt)
            .IsRequired();

        // Foreign key relationships
        builder.HasOne(ti => ti.Transaction)
            .WithMany(t => t.Items)
            .HasForeignKey(ti => ti.TransactionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(ti => ti.Category)
            .WithMany()
            .HasForeignKey(ti => ti.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(ti => ti.TransactionId);
        builder.HasIndex(ti => ti.CategoryId);
    }
}
