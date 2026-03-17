using System;

namespace HousingEstateManagement.Domain.Entities
{
    // Composite Key: ElectionId + UserId
    public class VoterLog
    {
        public int ElectionId { get; set; }
        public Election? Election { get; set; }

        public Guid UserId { get; set; }
        public User? User { get; set; }
        
        public int CandidateId { get; set; }

        public DateTime VotedAt { get; set; }
    }
}
