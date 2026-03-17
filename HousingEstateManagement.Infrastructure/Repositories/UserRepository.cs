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
    public class UserRepository : GenericRepository<User>, IUserRepository
    {
        public UserRepository(AppDbContext context) : base(context) { }

        public async Task<IEnumerable<User>> GetUsersByRoleAndBlockAsync(Role? role, int? blockId)
        {
            var query = _context.Users.AsQueryable();
            if (role.HasValue) query = query.Where(u => u.Role == role.Value);
            if (blockId.HasValue) query = query.Where(u => u.BlockId == blockId.Value);
            return await query.ToListAsync();
        }

        public async Task<IEnumerable<User>> GetActiveUsersWithDetailsAsync()
        {
            return await _context.Users
                .Include(u => u.Block)
                .Where(u => u.IsActive)
                .ToListAsync();
        }
    }
}
