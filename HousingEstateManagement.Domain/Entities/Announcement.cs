using System;
using HousingEstateManagement.Domain.Enums;

namespace HousingEstateManagement.Domain.Entities
{
    public class Announcement
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        
        public AnnouncementTarget TargetScope { get; set; }
        
        public int? TargetBlockId { get; set; }
        public Block? TargetBlock { get; set; }
        
        public Guid CreatedById { get; set; }
        public User? CreatedBy { get; set; }
        
        public DateTime CreatedDate { get; set; }
    }
}
