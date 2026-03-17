using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HousingEstateManagement.Domain.Common;
using HousingEstateManagement.Domain.Enums;

namespace HousingEstateManagement.Application.Interfaces.Services
{
    public interface IDashboardService
    {
        Task<Result<object>> GetDashboardSummaryAsync(Role role, int? blockId);
    }

    public interface IUserService
    {
        Task<Result<IEnumerable<object>>> GetAllUsersAsync();
    }

    public interface IBlockService
    {
        Task<Result<IEnumerable<object>>> GetBlocksAsync();
    }
}
