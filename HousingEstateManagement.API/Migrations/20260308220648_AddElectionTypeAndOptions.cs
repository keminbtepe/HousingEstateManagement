using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HousingEstateManagement.API.Migrations
{
    /// <inheritdoc />
    public partial class AddElectionTypeAndOptions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CandidateUserId",
                table: "VoterLogs");

            migrationBuilder.AddColumn<int>(
                name: "CandidateId",
                table: "VoterLogs",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<byte>(
                name: "Type",
                table: "Elections",
                type: "tinyint",
                nullable: false,
                defaultValue: (byte)0);

            migrationBuilder.AlterColumn<Guid>(
                name: "UserId",
                table: "ElectionCandidates",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AddColumn<string>(
                name: "OptionText",
                table: "ElectionCandidates",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CandidateId",
                table: "VoterLogs");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Elections");

            migrationBuilder.DropColumn(
                name: "OptionText",
                table: "ElectionCandidates");

            migrationBuilder.AddColumn<Guid>(
                name: "CandidateUserId",
                table: "VoterLogs",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AlterColumn<Guid>(
                name: "UserId",
                table: "ElectionCandidates",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);
        }
    }
}
