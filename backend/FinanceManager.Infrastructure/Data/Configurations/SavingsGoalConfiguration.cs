using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using FinanceManager.Core.Entities;

namespace FinanceManager.Infrastructure.Data.Configurations;

public class SavingsGoalConfiguration : IEntityTypeConfiguration<SavingsGoal>
{
    public void Configure(EntityTypeBuilder<SavingsGoal> builder)
    {
        builder.ToTable("SavingsGoals");

        builder.HasKey(sg => sg.Id);

        builder.Property(sg => sg.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(sg => sg.Description)
            .HasMaxLength(500);

        builder.Property(sg => sg.TargetAmount)
            .HasColumnType("decimal(18,2)");

        builder.Property(sg => sg.CurrentAmount)
            .HasColumnType("decimal(18,2)");

        builder.Property(sg => sg.Currency)
            .IsRequired()
            .HasMaxLength(3);

        builder.Property(sg => sg.Status)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(sg => sg.Icon)
            .HasMaxLength(50);

        builder.Property(sg => sg.Color)
            .HasMaxLength(20);

        builder.HasOne(sg => sg.User)
            .WithMany(u => u.SavingsGoals)
            .HasForeignKey(sg => sg.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(sg => sg.UserId);
        builder.HasIndex(sg => sg.Status);
    }
}
