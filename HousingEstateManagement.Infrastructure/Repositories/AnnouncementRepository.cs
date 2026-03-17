using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using HousingEstateManagement.Domain.Entities;
using HousingEstateManagement.Application.Interfaces.Repositories;
using HousingEstateManagement.Infrastructure.Persistence;

namespace HousingEstateManagement.Infrastructure.Repositories
{
    public class AnnouncementRepository : GenericRepository<Announcement>, IAnnouncementRepository
    {
        public AnnouncementRepository(AppDbContext context) : base(context) { }

        public async Task<IEnumerable<Announcement>> GetAnnouncementsWithDetailsAsync()
        {
            return await _context.Announcements
                .Include(a => a.TargetBlock)
                .Include(a => a.CreatedBy)
                .OrderByDescending(a => a.CreatedDate)
                .ToListAsync();
        }
    }
}
