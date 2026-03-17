using System.Collections.Generic;

namespace HousingEstateManagement.Domain.Entities
{
    public class Block
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int TotalApartments { get; set; }

        // Navigation Properties
        public ICollection<User> Users { get; set; } = new List<User>();
        public ICollection<Election> Elections { get; set; } = new List<Election>();
        public ICollection<RecurringTransaction> RecurringTransactions { get; set; } = new List<RecurringTransaction>();
        public ICollection<FinancialTransaction> FinancialTransactions { get; set; } = new List<FinancialTransaction>();
        public ICollection<Dues> DuesList { get; set; } = new List<Dues>();
        public ICollection<Announcement> Announcements { get; set; } = new List<Announcement>();
    }
}
