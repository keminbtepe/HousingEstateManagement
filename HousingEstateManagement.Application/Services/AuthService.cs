using System;
using System.Threading.Tasks;
using HousingEstateManagement.Domain.Entities;
using HousingEstateManagement.Domain.Common;
using HousingEstateManagement.Application.Interfaces.Services;
using HousingEstateManagement.Application.Interfaces.Repositories;

namespace HousingEstateManagement.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUnitOfWork _uow;
        private readonly IJwtService _jwtService;

        public AuthService(IUnitOfWork uow, IJwtService jwtService)
        {
            _uow = uow;
            _jwtService = jwtService;
        }

        public async Task<Result<string?>> LoginAsync(int? blockId, int? apartmentNumber, string password)
        {
            var users = await _uow.Users.GetAllAsync();
            var user = users.FirstOrDefault(u => u.BlockId == blockId && u.ApartmentNumber == apartmentNumber && u.IsActive);

            if (user == null || user.PasswordHash != password)
            {
                return Result<string?>.Failure("Hatalı giriş bilgileri veya pasif kullanıcı.");
            }

            var token = _jwtService.GenerateToken(user);
            return Result<string?>.Success(token);
        }
    }
}
