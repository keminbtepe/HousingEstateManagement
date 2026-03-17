using System;
using System.Security.Claims;
using HousingEstateManagement.Domain.Entities;

namespace HousingEstateManagement.Application.Interfaces.Services
{
    public interface IJwtService
    {
        string GenerateToken(User user);
    }
}
