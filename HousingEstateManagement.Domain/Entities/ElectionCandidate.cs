using System;

namespace HousingEstateManagement.Domain.Entities
{
    public class ElectionCandidate
    {
        public int Id { get; set; }
        
        public int ElectionId { get; set; }
        public Election? Election { get; set; }
        
        public Guid? UserId { get; set; }
        public User? User { get; set; }

        public string? OptionText { get; set; }

        public int VoteCount { get; set; }
    }
}
