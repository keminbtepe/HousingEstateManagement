using System;
using System.Threading.Tasks;
using HousingEstateManagement.Domain.Entities;

namespace HousingEstateManagement.Application.Interfaces.Repositories
{
    public interface IUnitOfWork : IDisposable
    {
        IElectionRepository Elections { get; }
        IUserRepository Users { get; }
        IFinancialTransactionRepository FinancialTransactions { get; }
        IAnnouncementRepository Announcements { get; }
        IRecurringTransactionRepository RecurringTransactions { get; }
        IGenericRepository<VoterLog> VoterLogs { get; }
        IGenericRepository<ElectionCandidate> ElectionCandidates { get; }
        IGenericRepository<Block> Blocks { get; }
        IGenericRepository<Dues> Dues { get; }
        
        Task<int> SaveChangesAsync();
    }
}
