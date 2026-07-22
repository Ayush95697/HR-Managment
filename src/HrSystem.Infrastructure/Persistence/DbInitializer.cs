using System;
using System.Linq;
using System.Threading.Tasks;
using HrSystem.Domain.Entities;
using HrSystem.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace HrSystem.Infrastructure.Persistence;

public static class DbInitializer
{
    public static async Task SeedAsync(HrDbContext context)
    {
        await context.Database.EnsureCreatedAsync();

        // 1. Seed Roles
        if (!await context.Roles.AnyAsync(r => r.Id == (int)RoleType.Admin))
        {
            bool isSqlServer = context.Database.IsSqlServer();
            if (isSqlServer)
            {
                try
                {
                    await context.Database.ExecuteSqlRawAsync("SET IDENTITY_INSERT [Roles] ON;");
                }
                catch { }
            }

            if (!await context.Roles.AnyAsync(r => r.Id == (int)RoleType.Admin))
                context.Roles.Add(new Role { Id = (int)RoleType.Admin, Name = "Admin" });
            if (!await context.Roles.AnyAsync(r => r.Id == (int)RoleType.HR))
                context.Roles.Add(new Role { Id = (int)RoleType.HR, Name = "HR" });
            if (!await context.Roles.AnyAsync(r => r.Id == (int)RoleType.Employee))
                context.Roles.Add(new Role { Id = (int)RoleType.Employee, Name = "Employee" });

            await context.SaveChangesAsync();

            if (isSqlServer)
            {
                try
                {
                    await context.Database.ExecuteSqlRawAsync("SET IDENTITY_INSERT [Roles] OFF;");
                }
                catch { }
            }
        }

        // 2. Seed Departments
        Guid hrDeptId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        Guid engDeptId = Guid.Parse("22222222-2222-2222-2222-222222222222");
        Guid mktDeptId = Guid.Parse("33333333-3333-3333-3333-333333333333");

        if (!await context.Departments.AnyAsync())
        {
            context.Departments.AddRange(
                new Department { Id = hrDeptId, Name = "Human Resources" },
                new Department { Id = engDeptId, Name = "Engineering" },
                new Department { Id = mktDeptId, Name = "Marketing" }
            );
            await context.SaveChangesAsync();
        }

        // 3. Unconditionally Ensure Seed Users Exist and Password Hashes are Valid for "Admin123!"
        string defaultPasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!");
        Guid adminUserId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
        Guid hrUserId = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
        Guid employeeUserId = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc");

        // Admin User
        var admin = await context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == "admin@hrsystem.com");
        if (admin == null)
        {
            context.Users.Add(new User
            {
                Id = adminUserId,
                Name = "System Admin",
                Email = "admin@hrsystem.com",
                PasswordHash = defaultPasswordHash,
                RoleId = (int)RoleType.Admin,
                DepartmentId = null,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        }
        else
        {
            admin.PasswordHash = defaultPasswordHash;
            admin.IsActive = true;
            admin.RoleId = (int)RoleType.Admin;
        }

        // HR User
        var hr = await context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == "hr@hrsystem.com");
        if (hr == null)
        {
            context.Users.Add(new User
            {
                Id = hrUserId,
                Name = "Jane HR Manager",
                Email = "hr@hrsystem.com",
                PasswordHash = defaultPasswordHash,
                RoleId = (int)RoleType.HR,
                DepartmentId = hrDeptId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        }
        else
        {
            hr.PasswordHash = defaultPasswordHash;
            hr.IsActive = true;
            hr.RoleId = (int)RoleType.HR;
        }

        // Employee User
        var employee = await context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == "employee@hrsystem.com");
        if (employee == null)
        {
            context.Users.Add(new User
            {
                Id = employeeUserId,
                Name = "John Developer",
                Email = "employee@hrsystem.com",
                PasswordHash = defaultPasswordHash,
                RoleId = (int)RoleType.Employee,
                DepartmentId = engDeptId,
                ManagerId = hrUserId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        }
        else
        {
            employee.PasswordHash = defaultPasswordHash;
            employee.IsActive = true;
            employee.RoleId = (int)RoleType.Employee;
        }

        await context.SaveChangesAsync();

        // 4. Seed Sample Email Template
        if (!await context.EmailTemplates.AnyAsync())
        {
            context.EmailTemplates.Add(new EmailTemplate
            {
                Id = Guid.Parse("e1111111-1111-1111-1111-111111111111"),
                Name = "Performance Review Notice",
                Subject = "Upcoming Performance Review for {{EmployeeName}}",
                BodyHtml = "<p>Dear {{EmployeeName}},</p><p>Your performance review for period <strong>{{ReviewPeriod}}</strong> has been scheduled.</p><p>Best regards,<br/>HR Team</p>",
                PlaceholderSchemaJson = "{\"EmployeeName\":\"string\",\"ReviewPeriod\":\"string\"}"
            });
            await context.SaveChangesAsync();
        }

        // 5. Seed Sample Board & Columns & Cards
        Guid boardId = Guid.Parse("b1111111-1111-1111-1111-111111111111");
        if (!await context.Boards.AnyAsync())
        {
            var board = new Board
            {
                Id = boardId,
                Name = "HR Onboarding Board",
                OwnerId = hrUserId,
                DepartmentId = hrDeptId,
                CreatedAt = DateTime.UtcNow
            };

            var colTodo = new BoardColumn
            {
                Id = Guid.Parse("c1111111-1111-1111-1111-111111111111"),
                BoardId = boardId,
                Name = "To Do",
                Order = 0
            };

            var colInProgress = new BoardColumn
            {
                Id = Guid.Parse("c2222222-2222-2222-2222-222222222222"),
                BoardId = boardId,
                Name = "In Progress",
                Order = 1
            };

            var colDone = new BoardColumn
            {
                Id = Guid.Parse("c3333333-3333-3333-3333-333333333333"),
                BoardId = boardId,
                Name = "Done",
                Order = 2
            };

            board.Columns.Add(colTodo);
            board.Columns.Add(colInProgress);
            board.Columns.Add(colDone);

            context.Boards.Add(board);
            await context.SaveChangesAsync();

            var sampleCard = new TaskCard
            {
                Id = Guid.Parse("d1111111-1111-1111-1111-111111111111"),
                BoardId = boardId,
                ColumnId = colTodo.Id,
                AssignedToId = employeeUserId,
                Title = "Complete HR Profile Information",
                Description = "Please fill in tax details and emergency contacts.",
                Priority = TaskPriority.High,
                CreatedById = hrUserId,
                Position = 1024.0,
                RowVersion = new byte[] { 0, 0, 0, 0, 0, 0, 0, 1 },
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            context.TaskCards.Add(sampleCard);
            await context.SaveChangesAsync();
        }
    }
}
