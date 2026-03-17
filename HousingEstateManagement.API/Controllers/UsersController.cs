using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using HousingEstateManagement.Application.Interfaces.Services;
using HousingEstateManagement.Domain.Common;

namespace HousingEstateManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            var result = await _userService.GetAllUsersAsync();
            return Ok(result);
        }
    }
}
