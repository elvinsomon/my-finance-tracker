using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using FinanceManager.Core.Entities;

namespace FinanceManager.Infrastructure.Data.Configurations;

public class CategoryRuleConfiguration : IEntityTypeConfiguration<CategoryRule>
{
    public void Configure(EntityTypeBuilder<CategoryRule> builder)
    {
        builder.ToTable("CategoryRules");

        builder.HasKey(cr => cr.Id);

        builder.Property(cr => cr.RuleName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(cr => cr.Pattern)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(cr => cr.MatchType)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(cr => cr.Priority)
            .IsRequired()
            .HasDefaultValue(50);

        builder.Property(cr => cr.MatchCount)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(cr => cr.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(cr => cr.CreatedDate)
            .IsRequired();

        // Indexes for performance
        builder.HasIndex(cr => cr.UserId)
            .HasDatabaseName("IX_CategoryRules_UserId");

        builder.HasIndex(cr => cr.CategoryId)
            .HasDatabaseName("IX_CategoryRules_CategoryId");

        builder.HasIndex(cr => new { cr.UserId, cr.Priority })
            .HasDatabaseName("IX_CategoryRules_UserId_Priority");

        builder.HasIndex(cr => new { cr.UserId, cr.IsActive })
            .HasDatabaseName("IX_CategoryRules_UserId_IsActive");

        // Relationships
        builder.HasOne(cr => cr.User)
            .WithMany()
            .HasForeignKey(cr => cr.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(cr => cr.Category)
            .WithMany()
            .HasForeignKey(cr => cr.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
