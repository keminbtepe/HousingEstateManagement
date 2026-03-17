using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HousingEstateManagement.Domain.Entities;
using HousingEstateManagement.Domain.Enums;

namespace HousingEstateManagement.Application.Interfaces.Repositories
{
    public interface IUserRepository : IGenericRepository<User>
    {
        Task<IEnumerable<User>> GetUsersByRoleAndBlockAsync(Role? role, int? blockId);
        Task<IEnumerable<User>> GetActiveUsersWithDetailsAsync();
    }
}
