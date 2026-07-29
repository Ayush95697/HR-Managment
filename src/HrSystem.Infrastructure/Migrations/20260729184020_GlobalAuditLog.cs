using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HrSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class GlobalAuditLog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TaskActivityLogs");

            migrationBuilder.CreateTable(
                name: "SystemAuditLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ActorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Action = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EntityType = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    EntityId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Details = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MetadataJson = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SystemAuditLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SystemAuditLogs_Users_ActorId",
                        column: x => x.ActorId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_SystemAuditLogs_ActorId",
                table: "SystemAuditLogs",
                column: "ActorId");

            migrationBuilder.CreateIndex(
                name: "IX_SystemAuditLogs_EntityId",
                table: "SystemAuditLogs",
                column: "EntityId");

            migrationBuilder.CreateIndex(
                name: "IX_SystemAuditLogs_EntityType",
                table: "SystemAuditLogs",
                column: "EntityType");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SystemAuditLogs");

            migrationBuilder.CreateTable(
                name: "TaskActivityLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ActorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FromColumnId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TaskCardId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ToColumnId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Action = table.Column<int>(type: "int", nullable: false),
                    MetadataJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TaskActivityLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TaskActivityLogs_BoardColumns_FromColumnId",
                        column: x => x.FromColumnId,
                        principalTable: "BoardColumns",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_TaskActivityLogs_BoardColumns_ToColumnId",
                        column: x => x.ToColumnId,
                        principalTable: "BoardColumns",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_TaskActivityLogs_TaskCards_TaskCardId",
                        column: x => x.TaskCardId,
                        principalTable: "TaskCards",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TaskActivityLogs_Users_ActorId",
                        column: x => x.ActorId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_TaskActivityLogs_ActorId",
                table: "TaskActivityLogs",
                column: "ActorId");

            migrationBuilder.CreateIndex(
                name: "IX_TaskActivityLogs_FromColumnId",
                table: "TaskActivityLogs",
                column: "FromColumnId");

            migrationBuilder.CreateIndex(
                name: "IX_TaskActivityLogs_TaskCardId",
                table: "TaskActivityLogs",
                column: "TaskCardId");

            migrationBuilder.CreateIndex(
                name: "IX_TaskActivityLogs_ToColumnId",
                table: "TaskActivityLogs",
                column: "ToColumnId");
        }
    }
}
