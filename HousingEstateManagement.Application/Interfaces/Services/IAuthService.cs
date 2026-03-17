using System.Threading.Tasks;
using HousingEstateManagement.Domain.Common;

namespace HousingEstateManagement.Application.Interfaces.Services
{
    public interface IAuthService
    {
        Task<Result<string?>> LoginAsync(int? blockId, int? apartmentNumber, string password);
    }
}
