using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace FinanceManager.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddImportBasicFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ExternalTransactionId",
                table: "Transactions",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ImportHistoryId",
                table: "Transactions",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsImported",
                table: "Transactions",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "ImportHistory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    FinancialAccountId = table.Column<Guid>(type: "uuid", nullable: false),
                    OriginalFileName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    StoredFileName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    FileSizeBytes = table.Column<long>(type: "bigint", nullable: false),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    ImportDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    TotalRowsProcessed = table.Column<int>(type: "integer", nullable: false),
                    TransactionsImported = table.Column<int>(type: "integer", nullable: false),
                    ErrorsEncountered = table.Column<int>(type: "integer", nullable: false),
                    ErrorDetails = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ImportHistory", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ImportHistory_FinancialAccounts_FinancialAccountId",
                        column: x => x.FinancialAccountId,
                        principalTable: "FinancialAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ImportHistory_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_ExternalTransactionId",
                table: "Transactions",
                column: "ExternalTransactionId");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_ImportHistoryId",
                table: "Transactions",
                column: "ImportHistoryId");

            migrationBuilder.CreateIndex(
                name: "IX_ImportHistory_FinancialAccountId",
                table: "ImportHistory",
                column: "FinancialAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_ImportHistory_ImportDate",
                table: "ImportHistory",
                column: "ImportDate");

            migrationBuilder.CreateIndex(
                name: "IX_ImportHistory_UserId",
                table: "ImportHistory",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ImportHistory_UserId_ImportDate",
                table: "ImportHistory",
                columns: new[] { "UserId", "ImportDate" });

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_ImportHistory_ImportHistoryId",
                table: "Transactions",
                column: "ImportHistoryId",
                principalTable: "ImportHistory",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_ImportHistory_ImportHistoryId",
                table: "Transactions");

            migrationBuilder.DropTable(
                name: "ImportHistory");

            migrationBuilder.DropIndex(
                name: "IX_Transactions_ExternalTransactionId",
                table: "Transactions");

            migrationBuilder.DropIndex(
                name: "IX_Transactions_ImportHistoryId",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "ExternalTransactionId",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "ImportHistoryId",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "IsImported",
                table: "Transactions");
        }
    }
}
