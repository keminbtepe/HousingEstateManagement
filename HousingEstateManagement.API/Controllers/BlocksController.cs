using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using HousingEstateManagement.Application.Interfaces.Services;
using HousingEstateManagement.Domain.Common;

namespace HousingEstateManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BlocksController : ControllerBase
    {
        private readonly IBlockService _blockService;

        public BlocksController(IBlockService blockService)
        {
            _blockService = blockService;
        }

        [HttpGet]
        public async Task<IActionResult> GetBlocks()
        {
            var result = await _blockService.GetBlocksAsync();
            return Ok(result);
        }
    }
}
