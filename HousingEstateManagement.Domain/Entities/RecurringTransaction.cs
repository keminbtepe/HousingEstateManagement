using System;
using HousingEstateManagement.Domain.Enums;

namespace HousingEstateManagement.Domain.Entities
{
    public class RecurringTransaction
    {
        public int Id { get; set; }
        public string Description { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        
        public TransactionType TransactionType { get; set; }
        public int DayOfMonth { get; set; }
        public TargetPool TargetPool { get; set; }
        
        public int? BlockId { get; set; }
        public Block? Block { get; set; }
        
        public bool IsActive { get; set; }
        public DateTime NextExecutionDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}
