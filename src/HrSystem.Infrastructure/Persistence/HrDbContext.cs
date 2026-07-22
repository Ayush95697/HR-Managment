using HrSystem.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HrSystem.Infrastructure.Persistence;

public class HrDbContext : DbContext
{
    public HrDbContext(DbContextOptions<HrDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Board> Boards => Set<Board>();
    public DbSet<BoardColumn> BoardColumns => Set<BoardColumn>();
    public DbSet<TaskCard> TaskCards => Set<TaskCard>();
    public DbSet<TaskComment> TaskComments => Set<TaskComment>();
    public DbSet<TaskAttachment> TaskAttachments => Set<TaskAttachment>();
    public DbSet<TaskActivityLog> TaskActivityLogs => Set<TaskActivityLog>();
    public DbSet<EmailTemplate> EmailTemplates => Set<EmailTemplate>();
    public DbSet<EmailLog> EmailLogs => Set<EmailLog>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Role Configuration - ValueGeneratedNever allows explicit integer IDs (1=Admin, 2=HR, 3=Employee)
        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(r => r.Id);
            entity.Property(r => r.Id).ValueGeneratedNever();
            entity.Property(r => r.Name).IsRequired().HasMaxLength(50);
        });

        // Department Configuration
        modelBuilder.Entity<Department>(entity =>
        {
            entity.HasKey(d => d.Id);
            entity.Property(d => d.Name).IsRequired().HasMaxLength(100);
        });

        // User Configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.Property(u => u.Name).IsRequired().HasMaxLength(100);
            entity.Property(u => u.Email).IsRequired().HasMaxLength(150);
            entity.HasIndex(u => u.Email).IsUnique();

            entity.HasOne(u => u.Role)
                .WithMany(r => r.Users)
                .HasForeignKey(u => u.RoleId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(u => u.Department)
                .WithMany(d => d.Users)
                .HasForeignKey(u => u.DepartmentId)
                .OnDelete(DeleteBehavior.SetNull);

            // Self-referencing FK ManagerId
            entity.HasOne(u => u.Manager)
                .WithMany(m => m.DirectReports)
                .HasForeignKey(u => u.ManagerId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // Board Configuration
        modelBuilder.Entity<Board>(entity =>
        {
            entity.HasKey(b => b.Id);
            entity.Property(b => b.Name).IsRequired().HasMaxLength(100);

            entity.HasOne(b => b.Owner)
                .WithMany()
                .HasForeignKey(b => b.OwnerId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(b => b.Department)
                .WithMany(d => d.Boards)
                .HasForeignKey(b => b.DepartmentId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // BoardColumn Configuration
        modelBuilder.Entity<BoardColumn>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.Property(c => c.Name).IsRequired().HasMaxLength(100);

            entity.HasOne(c => c.Board)
                .WithMany(b => b.Columns)
                .HasForeignKey(c => c.BoardId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // TaskCard Configuration
        modelBuilder.Entity<TaskCard>(entity =>
        {
            entity.HasKey(tc => tc.Id);
            entity.Property(tc => tc.Title).IsRequired().HasMaxLength(200);
            entity.Property(tc => tc.Position).IsRequired();

            // BUG-04/16 FIX: IsConcurrencyToken() lets the app manage the byte[] value.
            // HasColumnType("binary(8)") ensures SQL Server stores exactly 8 bytes (not varbinary(max)),
            // compatible with Guid.NewGuid().ToByteArray().Take(8) assignments in service code.
            entity.Property(tc => tc.RowVersion)
                .IsConcurrencyToken()
                .HasColumnType("binary(8)")
                .HasMaxLength(8);

            entity.HasIndex(tc => new { tc.BoardId, tc.ColumnId });

            entity.HasOne(tc => tc.Board)
                .WithMany(b => b.Cards)
                .HasForeignKey(tc => tc.BoardId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(tc => tc.Column)
                .WithMany(c => c.Cards)
                .HasForeignKey(tc => tc.ColumnId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(tc => tc.AssignedTo)
                .WithMany()
                .HasForeignKey(tc => tc.AssignedToId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(tc => tc.CreatedBy)
                .WithMany()
                .HasForeignKey(tc => tc.CreatedById)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // TaskComment Configuration
        modelBuilder.Entity<TaskComment>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.Property(c => c.Body).IsRequired();

            entity.HasOne(c => c.TaskCard)
                .WithMany(tc => tc.Comments)
                .HasForeignKey(c => c.TaskCardId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(c => c.Author)
                .WithMany()
                .HasForeignKey(c => c.AuthorId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // TaskAttachment Configuration
        modelBuilder.Entity<TaskAttachment>(entity =>
        {
            entity.HasKey(a => a.Id);
            entity.Property(a => a.FileName).IsRequired().HasMaxLength(255);
            entity.Property(a => a.FileUrl).IsRequired().HasMaxLength(500);

            entity.HasOne(a => a.TaskCard)
                .WithMany(tc => tc.Attachments)
                .HasForeignKey(a => a.TaskCardId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(a => a.UploadedBy)
                .WithMany()
                .HasForeignKey(a => a.UploadedById)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // TaskActivityLog Configuration
        modelBuilder.Entity<TaskActivityLog>(entity =>
        {
            entity.HasKey(al => al.Id);
            entity.HasIndex(al => al.TaskCardId);

            entity.HasOne(al => al.TaskCard)
                .WithMany(tc => tc.ActivityLogs)
                .HasForeignKey(al => al.TaskCardId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(al => al.Actor)
                .WithMany()
                .HasForeignKey(al => al.ActorId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(al => al.FromColumn)
                .WithMany()
                .HasForeignKey(al => al.FromColumnId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(al => al.ToColumn)
                .WithMany()
                .HasForeignKey(al => al.ToColumnId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // EmailTemplate Configuration
        modelBuilder.Entity<EmailTemplate>(entity =>
        {
            entity.HasKey(t => t.Id);
            entity.Property(t => t.Name).IsRequired().HasMaxLength(100);
            entity.Property(t => t.Subject).IsRequired().HasMaxLength(200);
            entity.Property(t => t.BodyHtml).IsRequired();
        });

        // EmailLog Configuration
        modelBuilder.Entity<EmailLog>(entity =>
        {
            entity.HasKey(el => el.Id);
            entity.Property(el => el.IdempotencyKey).IsRequired().HasMaxLength(100);
            entity.HasIndex(el => el.IdempotencyKey).IsUnique();

            entity.HasOne(el => el.ToUser)
                .WithMany()
                .HasForeignKey(el => el.ToUserId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(el => el.Template)
                .WithMany(t => t.Logs)
                .HasForeignKey(el => el.TemplateId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(el => el.SentBy)
                .WithMany()
                .HasForeignKey(el => el.SentById)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // RefreshToken Configuration
        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasKey(rt => rt.Id);
            entity.Property(rt => rt.TokenHash).IsRequired().HasMaxLength(256);
            entity.HasIndex(rt => rt.TokenHash);

            entity.HasOne(rt => rt.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(rt => rt.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
