using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using HousingEstateManagement.Domain.Entities;
using HousingEstateManagement.Infrastructure.Persistence;
using HousingEstateManagement.Domain.Enums;

namespace HousingEstateManagement.API.Data
{
    public static class DbInitializer
    {
        public static async Task InitializeAsync(IServiceProvider serviceProvider)
        {
            using var context = new AppDbContext(serviceProvider.GetRequiredService<DbContextOptions<AppDbContext>>());

            // 1. Wipe database
            Console.WriteLine("Wiping database...");
            context.FinancialTransactions.RemoveRange(context.FinancialTransactions);
            context.VoterLogs.RemoveRange(context.VoterLogs);
            context.ElectionCandidates.RemoveRange(context.ElectionCandidates);
            context.Elections.RemoveRange(context.Elections);
            context.Announcements.RemoveRange(context.Announcements);
            context.Users.RemoveRange(context.Users);
            context.Blocks.RemoveRange(context.Blocks);
            await context.SaveChangesAsync();

            // Reset identity seeds so IDs start from 1 again
            var tablesToReseed = new[] { "Blocks", "Elections", "ElectionCandidates", "VoterLogs", "Announcements", "FinancialTransactions" };
            foreach (var table in tablesToReseed)
            {
                try { await context.Database.ExecuteSqlRawAsync($"DBCC CHECKIDENT ('{table}', RESEED, 0)"); }
                catch { /* Table may not have identity column or may not exist */ }
            }
            Console.WriteLine("Database Wiped.");

            // 2. Seed Blocks
            var blocks = new List<Block>
            {
                new Block { Name = "Blok-1", TotalApartments = 20 },
                new Block { Name = "Blok-2", TotalApartments = 25 },
                new Block { Name = "Blok-3", TotalApartments = 30 },
                new Block { Name = "Blok-4", TotalApartments = 20 },
                new Block { Name = "Blok-5", TotalApartments = 15 }
            };
            await context.Blocks.AddRangeAsync(blocks);
            await context.SaveChangesAsync();
            var b1 = blocks[0]; // Management block

            // 3. Seed Users
            var users = new List<User>();
            var rand = new Random();
            var firstNames = new[] { "Ahmet", "Mehmet", "Ali", "Veli", "Ayşe", "Fatma", "Zeynep", "Elif", "Mustafa", "Caner", "Deniz", "Ece", "Buse", "Mert", "Ozan", "Selin", "Harun", "İrem", "Kaan", "Leyla", "Murat", "Naz", "Pelin", "Seda", "Umut", "Gökhan", "Esra", "Bahar", "Oğuz", "Sibel", "Tunca", "Yasemin", "Kadir", "Filiz", "Ender", "Suna", "Tarık", "Derya", "Bülent", "Hale", "Cem", "Arzu", "Bora", "Lale" };
            var lastNames = new[] { "Yılmaz", "Kaya", "Demir", "Çelik", "Şahin", "Öztürk", "Aydın", "Bozkurt", "Kılıç", "Polat", "Turan", "Yavuz", "Aslan", "Bulut", "Korkmaz", "Şen", "Yıldırım", "Özdemir", "Çetin", "Yurt", "Sümer", "Güneş", "Aksoy", "Yıldız", "Arkan", "Tekin", "Erdem", "Koç", "Özcan", "Doğan", "Köse", "Önal", "Sarı", "Yücel" };

            // Site Management Staff
            var siteManager = new User { Id = Guid.NewGuid(), FirstName = "Kemal", LastName = "Yönetici", Role = Role.SiteManager, BlockId = b1.Id, ApartmentNumber = 101, IsActive = true, PasswordHash = "123456" };
            users.Add(siteManager);
            users.Add(new User { Id = Guid.NewGuid(), FirstName = "Selin", LastName = "Yardımcı", Role = Role.AssistantManager, BlockId = b1.Id, ApartmentNumber = 102, IsActive = true, PasswordHash = "123456" });
            users.Add(new User { Id = Guid.NewGuid(), FirstName = "Hasan", LastName = "Güvenlik", Role = Role.SiteStaff, BlockId = b1.Id, ApartmentNumber = 103, IsActive = true, PasswordHash = "123456" });
            users.Add(new User { Id = Guid.NewGuid(), FirstName = "Merve", LastName = "Sekreter", Role = Role.SiteStaff, BlockId = b1.Id, ApartmentNumber = 104, IsActive = true, PasswordHash = "123456" });

            foreach (var block in blocks)
            {
                // Each Block gets a Manager
                var blockManager = new User { Id = Guid.NewGuid(), FirstName = firstNames[rand.Next(firstNames.Length)], LastName = lastNames[rand.Next(lastNames.Length)], Role = Role.BlockManager, BlockId = block.Id, ApartmentNumber = 1, IsActive = true, PasswordHash = "123456" };
                users.Add(blockManager);

                // Each Block gets a Staff
                users.Add(new User { Id = Guid.NewGuid(), FirstName = firstNames[rand.Next(firstNames.Length)], LastName = lastNames[rand.Next(lastNames.Length)], Role = Role.BlockStaff, BlockId = block.Id, IsActive = true, PasswordHash = "123456" });

                // Fill Residents
                for (int apt = 2; apt <= block.TotalApartments; apt++)
                {
                    users.Add(new User
                    {
                        Id = Guid.NewGuid(),
                        FirstName = firstNames[rand.Next(firstNames.Length)],
                        LastName = lastNames[rand.Next(lastNames.Length)],
                        Role = rand.Next(1, 4) <= 2 ? Role.Owner : Role.Tenant,
                        BlockId = block.Id,
                        ApartmentNumber = apt,
                        IsActive = true,
                        PasswordHash = "123456"
                    });
                }
            }
            await context.Users.AddRangeAsync(users);
            await context.SaveChangesAsync();

            // 4. Seed Announcements
            var annList = new List<Announcement>
            {
                new Announcement { Title = "Bahar Temizliği Hakkında", Content = "Değerli sakinlerimiz, site genelinde bahar temizliği ve peyzaj düzenleme çalışmaları önümüzdeki Pazartesi günü başlayacaktır. Ortak kullanım alanlarındaki şahsi eşyaların kaldırılmasını rica ederiz.", TargetScope = AnnouncementTarget.SiteLevel, CreatedById = siteManager.Id, CreatedDate = DateTime.UtcNow.AddDays(-10) },
                new Announcement { Title = "Güvenlik Kamerası Güncellemesi", Content = "Site ana giriş ve otopark alanlarındaki güvenlik kameraları yüksek çözünürlüklü modellerle değiştirilmiştir. Kayıt kapasitesi 30 güne çıkarılmıştır.", TargetScope = AnnouncementTarget.SiteLevel, CreatedById = siteManager.Id, CreatedDate = DateTime.UtcNow.AddDays(-5) },
                new Announcement { Title = "Aidat Ödemeleri Hatırlatması", Content = "Her ayın ilk 10 günü içerisinde yapılması gereken aidat ödemeleriniz için gecikme faizi uygulanmaması adına vaktinde ödeme yapmanızı önemle rica ederiz.", TargetScope = AnnouncementTarget.SiteLevel, CreatedById = siteManager.Id, CreatedDate = DateTime.UtcNow.AddDays(-2) },
                new Announcement { Title = "Personel Eğitim Duyurusu", Content = "Site personellerimiz için önümüzdeki hafta sonu 'Yangın Güvenliği ve İlk Yardım' eğitimi düzenlenecektir. Hizmetlerde kısa süreli aksamalar olabilir.", TargetScope = AnnouncementTarget.StaffOnly, CreatedById = siteManager.Id, CreatedDate = DateTime.UtcNow.AddDays(-1) }
            };

            foreach (var block in blocks)
            {
                var manager = users.FirstOrDefault(u => u.BlockId == block.Id && u.Role == Role.BlockManager);
                if (manager != null)
                {
                    annList.Add(new Announcement { Title = $"{block.Name} Asansör Bakımı", Content = "Binamızdaki asansörlerin yıllık periyodik bakımı yarın 09:00 - 17:00 saatleri arasında gerçekleştirilecektir.", TargetScope = AnnouncementTarget.BlockLevel, TargetBlockId = block.Id, CreatedById = manager.Id, CreatedDate = DateTime.UtcNow.AddDays(-3) });
                    annList.Add(new Announcement { Title = $"{block.Name} Kapı Şifre Değişimi", Content = "Güvenlik gerekçesiyle bina giriş kapısı şifresi değiştirilecektir. Yeni şifreyi yönetim ofisinden veya görevlimizden öğrenebilirsiniz.", TargetScope = AnnouncementTarget.BlockLevel, TargetBlockId = block.Id, CreatedById = manager.Id, CreatedDate = DateTime.UtcNow.AddDays(-7) });
                    annList.Add(new Announcement { Title = $"{block.Name} Görevli Çalışma Saatleri", Content = "Bina görevlimizin öğle istirahat saati 12:30 - 13:30 olarak güncellenmiştir. Acil durumlar dışında bu saatlerde rahatsız edilmemesi rica olunur.", TargetScope = AnnouncementTarget.StaffOnly, TargetBlockId = block.Id, CreatedById = manager.Id, CreatedDate = DateTime.UtcNow.AddDays(-1) });
                }
            }
            await context.Announcements.AddRangeAsync(annList);
            await context.SaveChangesAsync();

            // 5. Seed Elections & Polls
            var polls = new List<Election>();
            polls.Add(new Election
            {
                Title = "Çocuk Parkı Yenileme Projesi",
                Description = "Sitemizdeki çocuk oyun alanının zemin kaplamasının ve oyuncakların yenilenmesi projesi hakkında görüşünüz nedir?",
                Type = ElectionType.Poll,
                Scope = ElectionScope.Site,
                StartDate = DateTime.UtcNow.AddDays(-2),
                EndDate = DateTime.UtcNow.AddDays(10),
                Candidates = new List<ElectionCandidate> { new ElectionCandidate { OptionText = "Hemen Yapılmalı" }, new ElectionCandidate { OptionText = "Gelecek Yıl Yapılmalı" }, new ElectionCandidate { OptionText = "Gerek Yok" } }
            });

            foreach (var block in blocks)
            {
                polls.Add(new Election
                {
                    Title = $"{block.Name} Boya Rengi Seçimi",
                    Description = "Bina iç cephesinin boyanması için düşünülen renk seçeneklerinden hangisini tercih edersiniz?",
                    Type = ElectionType.Poll,
                    Scope = ElectionScope.Block,
                    BlockId = block.Id,
                    StartDate = DateTime.UtcNow.AddDays(-5),
                    EndDate = DateTime.UtcNow.AddDays(5),
                    Candidates = new List<ElectionCandidate> { new ElectionCandidate { OptionText = "Kumsal Beji" }, new ElectionCandidate { OptionText = "Fildişi" }, new ElectionCandidate { OptionText = "Gri/Antrasit" } }
                });
            }
            await context.Elections.AddRangeAsync(polls);
            await context.SaveChangesAsync();

            // 6. Seed Financial Transactions
            var transactions = new List<FinancialTransaction>();
            // Site Pool Transactions
            transactions.Add(new FinancialTransaction { Description = "Haziran Ayı Ortak Alan Elektrik Faturası", Amount = 12500, TransactionType = TransactionType.Expense, TargetPool = TargetPool.SitePool, TransactionDate = DateTime.UtcNow.AddDays(-15), PerformedById = siteManager.Id });
            transactions.Add(new FinancialTransaction { Description = "Bahçe Sulama ve Su Faturası", Amount = 4800, TransactionType = TransactionType.Expense, TargetPool = TargetPool.SitePool, TransactionDate = DateTime.UtcNow.AddDays(-10), PerformedById = siteManager.Id });
            transactions.Add(new FinancialTransaction { Description = "Personel SGK ve Maaş Ödemeleri", Amount = 85000, TransactionType = TransactionType.Expense, TargetPool = TargetPool.SitePool, TransactionDate = DateTime.UtcNow.AddDays(-5), PerformedById = siteManager.Id });
            transactions.Add(new FinancialTransaction { Description = "Güvenlik Kamera Sistemi İyileştirme", Amount = 22000, TransactionType = TransactionType.Expense, TargetPool = TargetPool.SitePool, TransactionDate = DateTime.UtcNow.AddDays(-12), PerformedById = siteManager.Id });
            transactions.Add(new FinancialTransaction { Description = "Otopark Kiralama Geliri (Ticari Alan)", Amount = 15000, TransactionType = TransactionType.Income, TargetPool = TargetPool.SitePool, TransactionDate = DateTime.UtcNow.AddDays(-20), PerformedById = siteManager.Id });

            // Block Specific Transactions (Dues & Maintenance)
            foreach (var block in blocks)
            {
                var manager = users.FirstOrDefault(u => u.BlockId == block.Id && u.Role == Role.BlockManager);
                if (manager != null)
                {
                    // Income: Dues
                    transactions.Add(new FinancialTransaction { Description = $"{block.Name} Toplu Aidat Tahsilatı", Amount = 35000, TransactionType = TransactionType.Income, TargetPool = TargetPool.BlockPool, BlockId = block.Id, TransactionDate = DateTime.UtcNow.AddDays(-8), PerformedById = manager.Id });
                    // Expenses: Elevator, Cleaning, etc.
                    transactions.Add(new FinancialTransaction { Description = "Asansör Periyodik Bakım Gideri", Amount = rand.Next(1500, 3000), TransactionType = TransactionType.Expense, TargetPool = TargetPool.BlockPool, BlockId = block.Id, TransactionDate = DateTime.UtcNow.AddDays(-3), PerformedById = manager.Id });
                    transactions.Add(new FinancialTransaction { Description = "Ortak Alan Temizlik Malzemeleri", Amount = rand.Next(400, 1200), TransactionType = TransactionType.Expense, TargetPool = TargetPool.BlockPool, BlockId = block.Id, TransactionDate = DateTime.UtcNow.AddDays(-1), PerformedById = manager.Id });
                }
            }
            await context.FinancialTransactions.AddRangeAsync(transactions);
            await context.SaveChangesAsync();

            Console.WriteLine("Database Reset and Seeding Completed Successfully.");
        }
    }
}
