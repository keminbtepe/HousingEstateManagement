using System;
using System.Collections.Generic;
using HousingEstateManagement.Domain.Enums;

namespace HousingEstateManagement.Domain.Entities
{
    public class Election
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        
        public ElectionType Type { get; set; }

        public ElectionScope Scope { get; set; }
        
        public int? BlockId { get; set; }
        public Block? Block { get; set; }

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public VoterEligibility VoterEligibility { get; set; }
        public bool IsCompleted { get; set; }
        public int CreatedByRole { get; set; }

        // Navigation Properties
        public ICollection<ElectionCandidate> Candidates { get; set; } = new List<ElectionCandidate>();
        public ICollection<VoterLog> VoterLogs { get; set; } = new List<VoterLog>();
    }
}
