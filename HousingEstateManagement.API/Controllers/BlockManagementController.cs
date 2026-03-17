using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HousingEstateManagement.Domain.Entities;
using HousingEstateManagement.Domain.Enums;
using HousingEstateManagement.Application.Interfaces.Services;
using HousingEstateManagement.Infrastructure.Persistence;

namespace HousingEstateManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BlockManagementController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IFinancialService _financialService;

        public BlockManagementController(AppDbContext context, IFinancialService financialService)
        {
            _context = context;
            _financialService = financialService;
        }

        [HttpGet]
        public async Task<IActionResult> GetBlocksSummary()
        {
            var blocks = await _context.Blocks.ToListAsync();
            var summaries = new System.Collections.Generic.List<object>();

            foreach (var block in blocks)
            {
                var poolBalance = await _financialService.GetPoolBalanceAsync(TargetPool.BlockPool, block.Id);
                var manager = await _context.Users.FirstOrDefaultAsync(u => u.BlockId == block.Id && u.Role == Role.BlockManager);
                var residentCount = await _context.Users.CountAsync(u => u.BlockId == block.Id && u.IsActive);

                summaries.Add(new
                {
                    BlockId = block.Id,
                    BlockName = block.Name,
                    TotalApartments = block.TotalApartments,
                    ActiveResidents = residentCount,
                    CurrentBalance = poolBalance,
                    ManagerName = manager != null ? $"{manager.FirstName} {manager.LastName}" : "Atanmadı"
                });
            }

            return Ok(summaries);
        }
    }
}
