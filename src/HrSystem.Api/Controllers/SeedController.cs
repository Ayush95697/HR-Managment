using System;
using System.Linq;
using System.Threading.Tasks;
using HrSystem.Domain.Entities;
using HrSystem.Domain.Enums;
using HrSystem.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HrSystem.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SeedController : ControllerBase
{
    private readonly HrDbContext _context;

    public SeedController(HrDbContext context)
    {
        _context = context;
    }

    [HttpPost("generate")]
    public async Task<IActionResult> GenerateTestData()
    {
        try
        {
            string defaultPasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!");

            // 1. Get Departments
            var engDept = await _context.Departments.FirstOrDefaultAsync(d => d.Name == "Engineering");
            var hrDept = await _context.Departments.FirstOrDefaultAsync(d => d.Name == "Human Resources");
            var mktDept = await _context.Departments.FirstOrDefaultAsync(d => d.Name == "Marketing");

            if (engDept == null || hrDept == null || mktDept == null)
            {
                return BadRequest("Core departments not found. Make sure initial seeding ran.");
            }

            // 2. Add New Users
            var newUsers = new[]
            {
                new User { Id = Guid.NewGuid(), Name = "Alice Smith", Email = "alice@hrsystem.com", PasswordHash = defaultPasswordHash, RoleId = (int)RoleType.Employee, DepartmentId = engDept.Id, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new User { Id = Guid.NewGuid(), Name = "Bob Jones", Email = "bob@hrsystem.com", PasswordHash = defaultPasswordHash, RoleId = (int)RoleType.Employee, DepartmentId = mktDept.Id, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new User { Id = Guid.NewGuid(), Name = "Charlie Brown", Email = "charlie@hrsystem.com", PasswordHash = defaultPasswordHash, RoleId = (int)RoleType.HR, DepartmentId = engDept.Id, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new User { Id = Guid.NewGuid(), Name = "Eve Adams", Email = "eve@hrsystem.com", PasswordHash = defaultPasswordHash, RoleId = (int)RoleType.HR, DepartmentId = mktDept.Id, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new User { Id = Guid.NewGuid(), Name = "Diana Prince", Email = "diana@hrsystem.com", PasswordHash = defaultPasswordHash, RoleId = (int)RoleType.Employee, DepartmentId = engDept.Id, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
            };

            _context.Users.AddRange(newUsers);
            await _context.SaveChangesAsync();

            // Fetch Akshay Pal to assign him some new cards
            var akshay = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower().Contains("akshay"));
            
            // 3. Add Boards
            var board1 = new Board { Id = Guid.NewGuid(), Name = "Marketing Campaign Q3", OwnerId = newUsers[2].Id, DepartmentId = mktDept.Id, CreatedAt = DateTime.UtcNow };
            var board2 = new Board { Id = Guid.NewGuid(), Name = "Backend Refactoring", OwnerId = newUsers[2].Id, DepartmentId = engDept.Id, CreatedAt = DateTime.UtcNow };
            var board3 = new Board { Id = Guid.NewGuid(), Name = "Employee Wellbeing Program", OwnerId = newUsers[2].Id, DepartmentId = hrDept.Id, CreatedAt = DateTime.UtcNow };

            _context.Boards.AddRange(board1, board2, board3);
            await _context.SaveChangesAsync();

            // 4. Add Columns
            var b1c1 = new BoardColumn { Id = Guid.NewGuid(), BoardId = board1.Id, Name = "Planning", Order = 0 };
            var b1c2 = new BoardColumn { Id = Guid.NewGuid(), BoardId = board1.Id, Name = "Execution", Order = 1 };
            
            var b2c1 = new BoardColumn { Id = Guid.NewGuid(), BoardId = board2.Id, Name = "Backlog", Order = 0 };
            var b2c2 = new BoardColumn { Id = Guid.NewGuid(), BoardId = board2.Id, Name = "In Review", Order = 1 };

            var b3c1 = new BoardColumn { Id = Guid.NewGuid(), BoardId = board3.Id, Name = "Ideas", Order = 0 };
            var b3c2 = new BoardColumn { Id = Guid.NewGuid(), BoardId = board3.Id, Name = "Approved", Order = 1 };

            _context.BoardColumns.AddRange(b1c1, b1c2, b2c1, b2c2, b3c1, b3c2);
            await _context.SaveChangesAsync();

            // 5. Add Cards
            var cards = new[]
            {
                new TaskCard { Id = Guid.NewGuid(), BoardId = board1.Id, ColumnId = b1c1.Id, AssignedToId = newUsers[1].Id, Title = "Draft Email Copy", Description = "Write copy for Q3 launch", Priority = TaskPriority.Medium, CreatedById = newUsers[2].Id, Position = 1000, RowVersion = Guid.NewGuid().ToByteArray().Take(8).ToArray() },
                new TaskCard { Id = Guid.NewGuid(), BoardId = board1.Id, ColumnId = b1c2.Id, AssignedToId = newUsers[1].Id, Title = "Design Assets", Description = "Create banners", Priority = TaskPriority.High, CreatedById = newUsers[2].Id, Position = 2000, RowVersion = Guid.NewGuid().ToByteArray().Take(8).ToArray() },
                
                new TaskCard { Id = Guid.NewGuid(), BoardId = board2.Id, ColumnId = b2c1.Id, AssignedToId = newUsers[0].Id, Title = "Update Entity Framework", Description = "Upgrade to EF Core 8", Priority = TaskPriority.Low, CreatedById = newUsers[2].Id, Position = 1000, RowVersion = Guid.NewGuid().ToByteArray().Take(8).ToArray() },
                new TaskCard { Id = Guid.NewGuid(), BoardId = board2.Id, ColumnId = b2c1.Id, AssignedToId = akshay?.Id ?? newUsers[3].Id, Title = "Optimize SQL Queries", Description = "Fix N+1 query issues in Boards", Priority = TaskPriority.High, CreatedById = newUsers[2].Id, Position = 2000, RowVersion = Guid.NewGuid().ToByteArray().Take(8).ToArray() },
                new TaskCard { Id = Guid.NewGuid(), BoardId = board2.Id, ColumnId = b2c2.Id, AssignedToId = newUsers[3].Id, Title = "Fix auth bug", Description = "Token expiration issue", Priority = TaskPriority.High, CreatedById = newUsers[2].Id, Position = 3000, RowVersion = Guid.NewGuid().ToByteArray().Take(8).ToArray() },

                new TaskCard { Id = Guid.NewGuid(), BoardId = board3.Id, ColumnId = b3c1.Id, AssignedToId = null, Title = "Yoga Fridays", Description = "Hire an instructor", Priority = TaskPriority.Low, CreatedById = newUsers[2].Id, Position = 1000, RowVersion = Guid.NewGuid().ToByteArray().Take(8).ToArray() }
            };

            _context.TaskCards.AddRange(cards);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Successfully seeded test data into the database." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message, stackTrace = ex.StackTrace });
        }
    }
}
