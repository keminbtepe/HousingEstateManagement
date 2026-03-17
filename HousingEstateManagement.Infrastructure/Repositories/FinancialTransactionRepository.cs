using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using HousingEstateManagement.Domain.Entities;
using HousingEstateManagement.Domain.Enums;
using HousingEstateManagement.Application.Interfaces.Repositories;
using HousingEstateManagement.Infrastructure.Persistence;

namespace HousingEstateManagement.Infrastructure.Repositories
{
    public class FinancialTransactionRepository : GenericRepository<FinancialTransaction>, IFinancialTransactionRepository
    {
        public FinancialTransactionRepository(AppDbContext context) : base(context) { }

        public async Task<IEnumerable<FinancialTransaction>> GetRecentTransactionsAsync(Role role, int? blockId, int count)
        {
            return await _context.FinancialTransactions
                .Where(t => (role == Role.SiteManager && t.TargetPool == TargetPool.SitePool) ||
                            (t.TargetPool == TargetPool.BlockPool && t.BlockId == blockId))
                .OrderByDescending(t => t.TransactionDate)
                .Take(count)
                .ToListAsync();
        }
    }
}
