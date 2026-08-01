using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HrSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class EnforceHrManagerRule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
WITH RankedHRs AS (
    SELECT Id, 
           ROW_NUMBER() OVER(PARTITION BY DepartmentId ORDER BY CreatedAt ASC) as row_num
    FROM Users
    WHERE RoleId = 2 AND DepartmentId IS NOT NULL
)
DELETE FROM Users
WHERE Id IN (SELECT Id FROM RankedHRs WHERE row_num > 1);

UPDATE e
SET ManagerId = hr.Id
FROM Users e
INNER JOIN Users hr ON e.DepartmentId = hr.DepartmentId AND hr.RoleId = 2
WHERE e.RoleId = 3;
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}