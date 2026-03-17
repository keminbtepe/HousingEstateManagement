using HousingEstateManagement.Domain.Enums;

namespace HousingEstateManagement.Application.DTOs
{
    public class UserDto
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public Role Role { get; set; }
        public int? BlockId { get; set; }
    }

    public class AnnouncementDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }
        public AnnouncementTarget Target { get; set; }
    }

    public class FinancialTransactionDto
    {
        public int Id { get; set; }
        public decimal Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public TransactionType Type { get; set; }
        public DateTime Date { get; set; }
    }

    public class BlockDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }
}
