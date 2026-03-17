using System;
using System.Collections.Generic;
using HousingEstateManagement.Domain.Enums;

namespace HousingEstateManagement.Domain.Entities
{
    public class User
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        
        public int? BlockId { get; set; }
        public Block? Block { get; set; }

        public int? ApartmentNumber { get; set; }
        public string PasswordHash { get; set; } = string.Empty;
        
        public Role Role { get; set; }
        public bool IsActive { get; set; }

        // Navigation Properties
        public ICollection<ElectionCandidate> CandidatesInfo { get; set; } = new List<ElectionCandidate>();
        public ICollection<VoterLog> VoterLogs { get; set; } = new List<VoterLog>();
        public ICollection<FinancialTransaction> PerformedTransactions { get; set; } = new List<FinancialTransaction>();
        public ICollection<Dues> DuesList { get; set; } = new List<Dues>();
        public ICollection<Announcement> CreatedAnnouncements { get; set; } = new List<Announcement>();
    }
}
