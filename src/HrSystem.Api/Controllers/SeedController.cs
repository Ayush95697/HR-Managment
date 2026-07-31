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

            // 1. Get or Create Departments
            var engDept = await _context.Departments.FirstOrDefaultAsync(d => d.Name == "Engineering");
            if (engDept == null)
            {
                engDept = new Department { Id = Guid.NewGuid(), Name = "Engineering" };
                _context.Departments.Add(engDept);
            }

            var hrDept = await _context.Departments.FirstOrDefaultAsync(d => d.Name == "Human Resources");
            if (hrDept == null)
            {
                hrDept = new Department { Id = Guid.NewGuid(), Name = "Human Resources" };
                _context.Departments.Add(hrDept);
            }

            var mktDept = await _context.Departments.FirstOrDefaultAsync(d => d.Name == "Marketing");
            if (mktDept == null)
            {
                mktDept = new Department { Id = Guid.NewGuid(), Name = "Marketing" };
                _context.Departments.Add(mktDept);
            }

            await _context.SaveChangesAsync();

            // 2. Get or Create Users
            var alice = await GetOrCreateUser("alice@hrsystem.com", "Alice Smith", (int)RoleType.Employee, engDept.Id, defaultPasswordHash);
            var bob = await GetOrCreateUser("bob@hrsystem.com", "Bob Jones", (int)RoleType.Employee, mktDept.Id, defaultPasswordHash);
            var charlie = await GetOrCreateUser("charlie@hrsystem.com", "Charlie Brown", (int)RoleType.HR, engDept.Id, defaultPasswordHash);
            var eve = await GetOrCreateUser("eve@hrsystem.com", "Eve Adams", (int)RoleType.HR, mktDept.Id, defaultPasswordHash);
            var diana = await GetOrCreateUser("diana@hrsystem.com", "Diana Prince", (int)RoleType.Employee, engDept.Id, defaultPasswordHash);

            await _context.SaveChangesAsync();

            // Fetch Akshay Pal to assign him some new cards
            var akshay = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower().Contains("akshay"));

            // 3. Get or Create Boards
            var board1 = await GetOrCreateBoard("Marketing Campaign Q3", charlie.Id, mktDept.Id);
            var board2 = await GetOrCreateBoard("Backend Refactoring", charlie.Id, engDept.Id);
            var board3 = await GetOrCreateBoard("Employee Wellbeing Program", charlie.Id, hrDept.Id);

            await _context.SaveChangesAsync();

            // 4. Get or Create Columns
            var b1c1 = await GetOrCreateColumn(board1.Id, "Planning", 0);
            var b1c2 = await GetOrCreateColumn(board1.Id, "Execution", 1);

            var b2c1 = await GetOrCreateColumn(board2.Id, "Backlog", 0);
            var b2c2 = await GetOrCreateColumn(board2.Id, "In Review", 1);

            var b3c1 = await GetOrCreateColumn(board3.Id, "Ideas", 0);
            var b3c2 = await GetOrCreateColumn(board3.Id, "Approved", 1);

            await _context.SaveChangesAsync();

            // 5. Get or Create Cards
            await GetOrCreateCard(board1.Id, b1c1.Id, bob.Id, charlie.Id, "Draft Email Copy", "Write copy for Q3 launch", TaskPriority.Medium, 1000);
            await GetOrCreateCard(board1.Id, b1c2.Id, bob.Id, charlie.Id, "Design Assets", "Create banners", TaskPriority.High, 2000);

            await GetOrCreateCard(board2.Id, b2c1.Id, alice.Id, charlie.Id, "Update Entity Framework", "Upgrade to EF Core 8", TaskPriority.Low, 1000);
            await GetOrCreateCard(board2.Id, b2c1.Id, akshay?.Id ?? diana.Id, charlie.Id, "Optimize SQL Queries", "Fix N+1 query issues in Boards", TaskPriority.High, 2000);
            await GetOrCreateCard(board2.Id, b2c2.Id, diana.Id, charlie.Id, "Fix auth bug", "Token expiration issue", TaskPriority.High, 3000);

            await GetOrCreateCard(board3.Id, b3c1.Id, null, charlie.Id, "Yoga Fridays", "Hire an instructor", TaskPriority.Low, 1000);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Successfully seeded test data into the database." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message, stackTrace = ex.StackTrace });
        }
    }

    private async Task<User> GetOrCreateUser(string email, string name, int roleId, Guid deptId, string hash)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null)
        {
            user = new User { Id = Guid.NewGuid(), Name = name, Email = email, PasswordHash = hash, RoleId = roleId, DepartmentId = deptId, IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
            _context.Users.Add(user);
        }
        else
        {
            user.DepartmentId = deptId;
            user.RoleId = roleId;
            user.IsActive = true;
        }
        return user;
    }

    private async Task<Board> GetOrCreateBoard(string name, Guid ownerId, Guid deptId)
    {
        var board = await _context.Boards.FirstOrDefaultAsync(b => b.Name == name);
        if (board == null)
        {
            board = new Board { Id = Guid.NewGuid(), Name = name, OwnerId = ownerId, DepartmentId = deptId, CreatedAt = DateTime.UtcNow };
            _context.Boards.Add(board);
        }
        return board;
    }

    private async Task<BoardColumn> GetOrCreateColumn(Guid boardId, string name, int order)
    {
        var col = await _context.BoardColumns.FirstOrDefaultAsync(c => c.BoardId == boardId && c.Name == name);
        if (col == null)
        {
            col = new BoardColumn { Id = Guid.NewGuid(), BoardId = boardId, Name = name, Order = order };
            _context.BoardColumns.Add(col);
        }
        return col;
    }

    private async Task<TaskCard> GetOrCreateCard(Guid boardId, Guid colId, Guid? assignedTo, Guid createdBy, string title, string desc, TaskPriority priority, double pos)
    {
        var card = await _context.TaskCards.FirstOrDefaultAsync(c => c.BoardId == boardId && c.Title == title);
        if (card == null)
        {
            card = new TaskCard { Id = Guid.NewGuid(), BoardId = boardId, ColumnId = colId, AssignedToId = assignedTo, Title = title, Description = desc, Priority = priority, CreatedById = createdBy, Position = pos, RowVersion = Guid.NewGuid().ToByteArray().Take(8).ToArray(), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
            _context.TaskCards.Add(card);
        }
        return card;
    }
}
