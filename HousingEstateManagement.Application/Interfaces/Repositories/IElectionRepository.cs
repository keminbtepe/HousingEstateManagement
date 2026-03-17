using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HousingEstateManagement.Domain.Entities;
using HousingEstateManagement.Domain.Enums;

namespace HousingEstateManagement.Application.Interfaces.Repositories
{
    public interface IElectionRepository : IGenericRepository<Election>
    {
        Task<IEnumerable<Election>> GetElectionsWithCandidatesAsync(ElectionScope? scope, int? blockId);
        Task<Election> GetElectionWithCandidatesAsync(int id);
    }
}
