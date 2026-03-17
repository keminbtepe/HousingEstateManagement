using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using HousingEstateManagement.Application.Interfaces.Services;
using HousingEstateManagement.Application.Interfaces.Repositories;
using HousingEstateManagement.Domain.Enums;
using HousingEstateManagement.Domain.Common;

namespace HousingEstateManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;
        private readonly IUnitOfWork _uow;
        private readonly IFinancialService _financialService;

        public DashboardController(IDashboardService dashboardService, IUnitOfWork uow, IFinancialService financialService)
        {
            _dashboardService = dashboardService;
            _uow = uow;
            _financialService = financialService;
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary([FromQuery] int role, [FromQuery] int? blockId)
        {
            var result = await _dashboardService.GetDashboardSummaryAsync((Role)role, blockId);
            return Ok(result);
        }

        [HttpGet("block-summaries")]
        public async Task<IActionResult> GetBlockSummaries()
        {
            var blocks = await _uow.Blocks.GetAllAsync();
            var users = await _uow.Users.GetAllAsync();

            var summaries = new List<object>();

            foreach (var block in blocks)
            {
                var blockUsers = users.Where(u => u.BlockId == block.Id).ToList();
                var manager = blockUsers.FirstOrDefault(u => u.Role == Role.BlockManager);
                var activeResidents = blockUsers.Count(u => u.Role == Role.Owner || u.Role == Role.Tenant);
                var balanceResult = await _financialService.GetPoolBalanceAsync(TargetPool.BlockPool, block.Id);

                summaries.Add(new
                {
                    BlockId = block.Id,
                    BlockName = block.Name,
                    ManagerName = manager != null ? $"{manager.FirstName} {manager.LastName}" : null,
                    TotalApartments = block.TotalApartments,
                    ActiveResidents = activeResidents,
                    Balance = balanceResult.Data
                });
            }

            return Ok(Result<List<object>>.Success(summaries));
        }
    }
}
