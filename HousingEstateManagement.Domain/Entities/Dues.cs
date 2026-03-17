using System;
using HousingEstateManagement.Domain.Enums;

namespace HousingEstateManagement.Domain.Entities
{
    public class Dues
    {
        public int Id { get; set; }
        
        public Guid UserId { get; set; }
        public User? User { get; set; }
        
        public int BlockId { get; set; }
        public Block? Block { get; set; }
        
        public decimal Amount { get; set; }
        public DateTime MonthYear { get; set; }
        public DateTime DueDate { get; set; }
        
        public DuesStatus Status { get; set; }
        public DateTime? PaidDate { get; set; }
    }
}
