using Microsoft.EntityFrameworkCore;
using HousingEstateManagement.Domain.Entities;

namespace HousingEstateManagement.Infrastructure.Persistence
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Block> Blocks { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Election> Elections { get; set; }
        public DbSet<ElectionCandidate> ElectionCandidates { get; set; }
        public DbSet<VoterLog> VoterLogs { get; set; }
        public DbSet<RecurringTransaction> RecurringTransactions { get; set; }
        public DbSet<FinancialTransaction> FinancialTransactions { get; set; }
        public DbSet<Dues> DuesList { get; set; }
        public DbSet<Announcement> Announcements { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Composite Key for VoterLog
            modelBuilder.Entity<VoterLog>()
                .HasKey(v => new { v.ElectionId, v.UserId });

            // Ensure NoAction for VoterLog -> User to prevent multiple cascade paths
            modelBuilder.Entity<VoterLog>()
                .HasOne(v => v.User)
                .WithMany(u => u.VoterLogs)
                .HasForeignKey(v => v.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<VoterLog>()
                .HasOne(v => v.Election)
                .WithMany(e => e.VoterLogs)
                .HasForeignKey(v => v.ElectionId)
                .OnDelete(DeleteBehavior.Restrict);
                
            modelBuilder.Entity<ElectionCandidate>()
                .HasOne(ec => ec.User)
                .WithMany(u => u.CandidatesInfo)
                .HasForeignKey(ec => ec.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<FinancialTransaction>()
                .HasOne(ft => ft.PerformedBy)
                .WithMany(u => u.PerformedTransactions)
                .HasForeignKey(ft => ft.PerformedById)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Announcement>()
                .HasOne(a => a.CreatedBy)
                .WithMany(u => u.CreatedAnnouncements)
                .HasForeignKey(a => a.CreatedById)
                .OnDelete(DeleteBehavior.Restrict);
                
            modelBuilder.Entity<Dues>()
                .HasOne(d => d.User)
                .WithMany(u => u.DuesList)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
