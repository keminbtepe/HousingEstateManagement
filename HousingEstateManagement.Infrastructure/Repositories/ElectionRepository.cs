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
    public class ElectionRepository : GenericRepository<Election>, IElectionRepository
    {
        public ElectionRepository(AppDbContext context) : base(context) { }

        public async Task<IEnumerable<Election>> GetElectionsWithCandidatesAsync(ElectionScope? scope, int? blockId)
        {
            var query = _context.Elections
                .Include(e => e.Candidates)
                    .ThenInclude(c => c.User)
                .Include(e => e.Block)
                .AsQueryable();

            if (scope == ElectionScope.Block && blockId.HasValue)
            {
                query = query.Where(e => e.Scope == ElectionScope.Site || (e.Scope == ElectionScope.Block && e.BlockId == blockId.Value));
            }

            return await query.ToListAsync();
        }

        public async Task<Election> GetElectionWithCandidatesAsync(int id)
        {
            return await _context.Elections
                .Include(e => e.Candidates)
                .Include(e => e.VoterLogs)
                .FirstOrDefaultAsync(e => e.Id == id);
        }
    }
}
