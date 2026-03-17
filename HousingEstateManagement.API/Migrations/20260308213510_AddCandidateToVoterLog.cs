using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HousingEstateManagement.API.Migrations
{
    /// <inheritdoc />
    public partial class AddCandidateToVoterLog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CandidateUserId",
                table: "VoterLogs",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CandidateUserId",
                table: "VoterLogs");
        }
    }
}
