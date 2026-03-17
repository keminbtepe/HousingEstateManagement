namespace HousingEstateManagement.Domain.Enums
{
    public enum Role : byte
    {
        SiteManager = 1,
        AssistantManager = 2,
        BlockManager = 3,
        Owner = 4,
        Tenant = 5,
        SiteStaff = 6,
        BlockStaff = 7
    }

    public enum ElectionScope : byte
    {
        Site = 1,
        Block = 2
    }

    public enum VoterEligibility : byte
    {
        OwnersOnly = 1,
        TenantsOnly = 2,
        Everyone = 3
    }
    
    public enum ElectionType : byte
    {
        ManagerElection = 1,
        Poll = 2
    }

    public enum TransactionType : byte
    {
        Income = 1,
        Expense = 2
    }

    public enum TargetPool : byte
    {
        SitePool = 1,
        BlockPool = 2
    }

    public enum DuesStatus : byte
    {
        Pending = 1,
        Paid = 2,
        Overdue = 3
    }

    public enum AnnouncementTarget : byte
    {
        SiteLevel = 1,
        BlockLevel = 2,
        StaffOnly = 3
    }
}
