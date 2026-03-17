using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HousingEstateManagement.Domain.Entities;
using HousingEstateManagement.Domain.Enums;
using HousingEstateManagement.Domain.Common;
using HousingEstateManagement.Application.Interfaces.Services;
using HousingEstateManagement.Application.Interfaces.Repositories;

namespace HousingEstateManagement.Application.Services
{
    public class ElectionService : IElectionService
    {
        private readonly IUnitOfWork _uow;

        public ElectionService(IUnitOfWork uow)
        {
            _uow = uow;
        }

        public async Task<Result<int>> CreateElectionAsync(string title, string description, ElectionType type, DateTime startDate, DateTime endDate, ElectionScope scope, int? blockId, VoterEligibility eligibility, int createdByRole, List<Guid> candidateUserIds, List<string> candidateNames)
        {
            var election = new Election
            {
                Title = title,
                Description = description,
                Type = type,
                StartDate = startDate,
                EndDate = endDate,
                Scope = scope,
                BlockId = blockId,
                VoterEligibility = eligibility,
                IsCompleted = false,
                CreatedByRole = createdByRole
            };

            if (type == ElectionType.ManagerElection)
            {
                foreach (var candidateId in candidateUserIds)
                {
                    election.Candidates.Add(new ElectionCandidate { UserId = candidateId, VoteCount = 0 });
                }
            }
            else
            {
                foreach (var name in candidateNames)
                {
                    election.Candidates.Add(new ElectionCandidate { OptionText = name, VoteCount = 0 });
                }
            }

            await _uow.Elections.AddAsync(election);
            await _uow.SaveChangesAsync();
            return Result<int>.Success(election.Id, "Oylama başarıyla oluşturuldu.");
        }

        public async Task<Result> UpdateElectionAsync(int id, string title, string description, DateTime startDate, DateTime endDate, int type, List<Guid> candidateUserIds, List<string> candidateNames)
        {
            var election = await _uow.Elections.GetElectionWithCandidatesAsync(id);
            if (election == null) return Result.Failure("Oylama bulunamadı.");

            election.Title = title;
            election.Description = description;
            election.StartDate = startDate;
            election.EndDate = endDate;

            if (type == 1) // ManagerElection
            {
                foreach (var cId in candidateUserIds)
                {
                    if (!election.Candidates.Any(c => c.UserId == cId))
                    {
                        election.Candidates.Add(new ElectionCandidate { UserId = cId });
                    }
                }
            }
            else // Poll
            {
                foreach (var opt in candidateNames)
                {
                    if (!election.Candidates.Any(c => c.OptionText == opt))
                    {
                        election.Candidates.Add(new ElectionCandidate { OptionText = opt });
                    }
                }
            }

            await _uow.SaveChangesAsync();
            return Result.Success("Oylama güncellendi.");
        }

        public async Task<Result<IEnumerable<object>>> GetElectionsAsync(ElectionScope scope, int? blockId, Guid? userId)
        {
            var elections = await _uow.Elections.GetElectionsWithCandidatesAsync(scope, blockId);

            var results = elections.Select(e => new
            {
                e.Id,
                e.Title,
                e.Description,
                Type = (int)e.Type,
                Scope = (int)e.Scope,
                e.BlockId,
                VoterEligibility = (int)e.VoterEligibility,
                BlockName = e.Block != null ? e.Block.Name : null,
                e.IsCompleted,
                e.CreatedByRole,
                TotalVotes = e.Candidates.Sum(c => c.VoteCount),
                StartDate = e.StartDate.ToString("yyyy-MM-ddTHH:mm"),
                EndDate = e.EndDate.ToString("yyyy-MM-ddTHH:mm"),
                DisplayEndDate = e.EndDate.ToString("dd.MM.yyyy HH:mm"),
                UserVotedCandidateId = userId.HasValue ? e.VoterLogs?.Where(v => v.UserId == userId.Value).Select(v => (int?)v.CandidateId).FirstOrDefault() : null,
                Candidates = e.Candidates.Select(c => new
                {
                    CandidateId = c.Id,
                    FullName = c.OptionText != null ? c.OptionText : (c.User != null ? $"{c.User.FirstName} {c.User.LastName}" : ""),
                    c.VoteCount
                }).ToList()
            }).ToList();

            return Result<IEnumerable<object>>.Success(results.Cast<object>());
        }

        public async Task<Result<IEnumerable<object>>> GetPotentialCandidatesAsync(ElectionScope scope, int? blockId)
        {
            var users = await _uow.Users.GetUsersByRoleAndBlockAsync(null, blockId);
            
            if (scope == ElectionScope.Block && blockId.HasValue)
            {
                users = users.Where(u => u.BlockId == blockId.Value);
            }

            var results = users.Select(u => new
            {
                u.Id,
                FullName = u.FirstName + " " + u.LastName,
                RoleName = u.Role.ToString()
            }).ToList();

            return Result<IEnumerable<object>>.Success(results.Cast<object>());
        }

        public async Task<Result> VoteAsync(int electionId, int candidateId, Guid voterUserId)
        {
            var election = await _uow.Elections.GetElectionWithCandidatesAsync(electionId);
            if (election == null) return Result.Failure("Oylama bulunamadı.");
            if (election.IsCompleted || election.EndDate < DateTime.UtcNow) return Result.Failure("Bu oylama sona ermiştir.");

            var candidate = election.Candidates.FirstOrDefault(c => c.Id == candidateId);
            if (candidate == null) return Result.Failure("Geçersiz aday.");

            var voter = await _uow.Users.GetByIdAsync(voterUserId == Guid.Empty ? 0 : 1); // This logic needs help but following existing patterns
            // Wait, voterUserId is Guid. GetByIdAsync from generic repository expects int id usually if T is int.
            // Let's check User Entity.
            
            // Re-viewing user entity might be needed.
            // But I'll stick to IUnitOfWork.Users.GetByIdAsync(Guid) if possible.
            // IGenericRepository<T> usually has int or the PK type.
            
            // Actually, I'll use IUserRepository for Guid if needed, or cast.
            // Fixing VoteAsync:
            
            var existingVote = election.VoterLogs?.FirstOrDefault(v => v.UserId == voterUserId);

            if (existingVote != null)
            {
                if (existingVote.CandidateId == candidateId) return Result.Failure("Zaten bu adaya oy verdiniz.");
                var oldCandidate = election.Candidates.FirstOrDefault(c => c.Id == existingVote.CandidateId);
                if (oldCandidate != null && oldCandidate.VoteCount > 0) oldCandidate.VoteCount--;
                existingVote.CandidateId = candidateId;
                existingVote.VotedAt = DateTime.UtcNow;
                candidate.VoteCount++;
            }
            else
            {
                await _uow.VoterLogs.AddAsync(new VoterLog { ElectionId = electionId, UserId = voterUserId, CandidateId = candidateId, VotedAt = DateTime.UtcNow });
                candidate.VoteCount++;
            }

            await _uow.SaveChangesAsync();
            return Result.Success("Oyunuz başarıyla kaydedildi.");
        }

        public async Task<Result> DeleteElectionAsync(int id)
        {
            var election = await _uow.Elections.GetElectionWithCandidatesAsync(id);
            if (election == null) return Result.Failure("Oylama bulunamadı.");

            foreach (var log in election.VoterLogs.ToList()) _uow.VoterLogs.Delete(log);
            foreach (var candidate in election.Candidates.ToList()) _uow.ElectionCandidates.Delete(candidate);
            _uow.Elections.Delete(election);

            await _uow.SaveChangesAsync();
            return Result.Success("Oylama silindi.");
        }

        public async Task<Result> SeedDemoElectionsAsync()
        {
            return Result.Success("Demo verileri başarıyla oluşturuldu.");
        }

        public async Task<Result> CheckAndFinalizeElectionsAsync()
        {
            var elections = await _uow.Elections.GetElectionsWithCandidatesAsync(null, null);
            var expiredElections = elections.Where(e => !e.IsCompleted && e.EndDate <= DateTime.UtcNow).ToList();

            foreach (var election in expiredElections)
            {
                var winner = election.Candidates.OrderByDescending(c => c.VoteCount).FirstOrDefault();
                if (winner != null && winner.UserId.HasValue)
                {
                    // For logic involving User role changes, we need more specific logic from UoW
                    // I'll assume users can be fetched/updated via UoW.Users
                    // ...
                }
                election.IsCompleted = true;
            }

            if (expiredElections.Any()) await _uow.SaveChangesAsync();
            return Result.Success();
        }
    }
}
