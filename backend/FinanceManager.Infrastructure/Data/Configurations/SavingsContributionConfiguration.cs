using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using FinanceManager.Core.Entities;

namespace FinanceManager.Infrastructure.Data.Configurations;

public class SavingsContributionConfiguration : IEntityTypeConfiguration<SavingsContribution>
{
    public void Configure(EntityTypeBuilder<SavingsContribution> builder)
    {
        builder.ToTable("SavingsContributions");

        builder.HasKey(sc => sc.Id);

        builder.Property(sc => sc.Amount)
            .HasColumnType("decimal(18,2)");

        builder.Property(sc => sc.Notes)
            .HasMaxLength(500);

        builder.HasOne(sc => sc.Goal)
            .WithMany(sg => sg.SavingsContributions)
            .HasForeignKey(sc => sc.GoalId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(sc => sc.Transaction)
            .WithMany(t => t.SavingsContributions)
            .HasForeignKey(sc => sc.TransactionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(sc => sc.GoalId);
        builder.HasIndex(sc => sc.TransactionId);
    }
}
