using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using HousingEstateManagement.Application.Interfaces.Services;
using HousingEstateManagement.Domain.Common;

namespace HousingEstateManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto request)
        {
            var result = await _authService.LoginAsync(request.BlockId, request.ApartmentNumber, request.Password);
            
            if (!result.IsSuccess || result.Data == null)
            {
                return Unauthorized(result);
            }

            var token = result.Data;
            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadJwtToken(token);

            var userData = new 
            {
                id = jwtToken.Claims.First(c => c.Type == ClaimTypes.NameIdentifier).Value,
                fullName = jwtToken.Claims.First(c => c.Type == ClaimTypes.Name).Value,
                role = int.Parse(jwtToken.Claims.First(c => c.Type == ClaimTypes.Role).Value),
                roleName = GetRoleName(int.Parse(jwtToken.Claims.First(c => c.Type == ClaimTypes.Role).Value)),
                blockId = jwtToken.Claims.FirstOrDefault(c => c.Type == "BlockId")?.Value,
                apartmentNumber = jwtToken.Claims.FirstOrDefault(c => c.Type == "ApartmentNumber")?.Value
            };

            var finalResult = Result<object>.Success(new 
            {
                token = token, 
                user = userData
            }, "Giriş başarılı.");

            return Ok(finalResult);
        }

        private string GetRoleName(int roleId)
        {
            return roleId switch
            {
                1 => "Site Yöneticisi",
                2 => "Yönetici Yrd.",
                3 => "Blok Yöneticisi",
                4 => "Ev Sahibi",
                5 => "Kiracı",
                6 => "Site Görevlisi",
                7 => "Bina Görevlisi",
                _ => "Kullanıcı"
            };
        }
    }

    public class LoginDto
    {
        public int? BlockId { get; set; }
        public int? ApartmentNumber { get; set; }
        public string Password { get; set; } = string.Empty;
    }
}
