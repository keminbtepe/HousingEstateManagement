using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HousingEstateManagement.Domain.Common;
using HousingEstateManagement.Domain.Enums;

namespace HousingEstateManagement.Application.Interfaces.Services
{
    public interface IElectionService
    {
        Task<Result> CheckAndFinalizeElectionsAsync();
        Task<Result<int>> CreateElectionAsync(string title, string description, ElectionType type, DateTime startDate, DateTime endDate, ElectionScope scope, int? blockId, VoterEligibility eligibility, int createdByRole, List<Guid> candidateUserIds, List<string> candidateNames);
        Task<Result> UpdateElectionAsync(int id, string title, string description, DateTime startDate, DateTime endDate, int type, List<Guid> candidateUserIds, List<string> candidateNames);
        Task<Result<IEnumerable<object>>> GetElectionsAsync(ElectionScope scope, int? blockId, Guid? userId);
        Task<Result<IEnumerable<object>>> GetPotentialCandidatesAsync(ElectionScope scope, int? blockId);
        Task<Result> VoteAsync(int electionId, int candidateId, Guid voterUserId);
        Task<Result> DeleteElectionAsync(int id);
        Task<Result> SeedDemoElectionsAsync();
    }
}
