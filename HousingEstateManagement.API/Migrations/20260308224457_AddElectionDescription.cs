using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HousingEstateManagement.API.Migrations
{
    /// <inheritdoc />
    public partial class AddElectionDescription : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Elections",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Description",
                table: "Elections");
        }
    }
}
