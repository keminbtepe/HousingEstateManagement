using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HousingEstateManagement.API.Migrations
{
    /// <inheritdoc />
    public partial class AddEndDateToRecurring : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "EndDate",
                table: "RecurringTransactions",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EndDate",
                table: "RecurringTransactions");
        }
    }
}
