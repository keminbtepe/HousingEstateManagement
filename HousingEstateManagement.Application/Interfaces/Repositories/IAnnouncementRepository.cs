using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HousingEstateManagement.Domain.Entities;
using HousingEstateManagement.Domain.Enums;

namespace HousingEstateManagement.Application.Interfaces.Repositories
{
    public interface IAnnouncementRepository : IGenericRepository<Announcement>
    {
        Task<IEnumerable<Announcement>> GetAnnouncementsWithDetailsAsync();
    }
}
