using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HrSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddEmailTemplateOwner : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Clear out old templates and their logs as requested
            migrationBuilder.Sql("DELETE FROM EmailLogs");
            migrationBuilder.Sql("DELETE FROM EmailTemplates");

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "EmailTemplates",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_EmailTemplates_CreatedByUserId",
                table: "EmailTemplates",
                column: "CreatedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_EmailTemplates_Users_CreatedByUserId",
                table: "EmailTemplates",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EmailTemplates_Users_CreatedByUserId",
                table: "EmailTemplates");

            migrationBuilder.DropIndex(
                name: "IX_EmailTemplates_CreatedByUserId",
                table: "EmailTemplates");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "EmailTemplates");
        }
    }
}
