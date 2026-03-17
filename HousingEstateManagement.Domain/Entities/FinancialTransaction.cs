using System;
using HousingEstateManagement.Domain.Enums;

namespace HousingEstateManagement.Domain.Entities
{
    public class FinancialTransaction
    {
        public long Id { get; set; }
        public string Description { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        
        public TransactionType TransactionType { get; set; }
        public DateTime TransactionDate { get; set; }
        public TargetPool TargetPool { get; set; }
        
        public int? BlockId { get; set; }
        public Block? Block { get; set; }
        
        public bool IsAutomatic { get; set; }
        
        public Guid? PerformedById { get; set; }
        public User? PerformedBy { get; set; }
    }
}
