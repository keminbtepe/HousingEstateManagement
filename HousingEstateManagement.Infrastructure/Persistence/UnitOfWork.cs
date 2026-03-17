using System;
using System.Threading.Tasks;
using HousingEstateManagement.Application.Interfaces.Repositories;
using HousingEstateManagement.Infrastructure.Persistence;
using HousingEstateManagement.Domain.Entities;
using HousingEstateManagement.Infrastructure.Repositories;

namespace HousingEstateManagement.Infrastructure.Persistence
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly AppDbContext _context;
        private IElectionRepository? _elections;
        private IUserRepository? _users;
        private IFinancialTransactionRepository? _financialTransactions;
        private IAnnouncementRepository? _announcements;
        private IRecurringTransactionRepository? _recurringTransactions;
        private IGenericRepository<VoterLog>? _voterLogs;
        private IGenericRepository<ElectionCandidate>? _electionCandidates;
        private IGenericRepository<Block>? _blocks;
        private IGenericRepository<Dues>? _dues;

        public UnitOfWork(AppDbContext context)
        {
            _context = context;
        }

        public IElectionRepository Elections => _elections ??= new ElectionRepository(_context);
        public IUserRepository Users => _users ??= new UserRepository(_context);
        public IFinancialTransactionRepository FinancialTransactions => _financialTransactions ??= new FinancialTransactionRepository(_context);
        public IAnnouncementRepository Announcements => _announcements ??= new AnnouncementRepository(_context);
        public IRecurringTransactionRepository RecurringTransactions => _recurringTransactions ??= new RecurringTransactionRepository(_context);
        
        public IGenericRepository<VoterLog> VoterLogs => _voterLogs ??= new GenericRepository<VoterLog>(_context);
        public IGenericRepository<ElectionCandidate> ElectionCandidates => _electionCandidates ??= new GenericRepository<ElectionCandidate>(_context);
        public IGenericRepository<Block> Blocks => _blocks ??= new GenericRepository<Block>(_context);
        public IGenericRepository<Dues> Dues => _dues ??= new GenericRepository<Dues>(_context);

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}
