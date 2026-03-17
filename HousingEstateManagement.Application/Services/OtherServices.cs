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
    public class DashboardService : IDashboardService
    {
        private readonly IUnitOfWork _uow;
        private readonly IFinancialService _financialService;

        public DashboardService(IUnitOfWork uow, IFinancialService financialService)
        {
            _uow = uow;
            _financialService = financialService;
        }

        public async Task<Result<object>> GetDashboardSummaryAsync(Role role, int? blockId)
        {
            decimal poolBalance = 0;
            if (role == Role.SiteManager)
            {
                var balanceResult = await _financialService.GetPoolBalanceAsync(TargetPool.SitePool, null);
                poolBalance = balanceResult.Data;
            }
            else if (blockId.HasValue)
            {
                var balanceResult = await _financialService.GetPoolBalanceAsync(TargetPool.BlockPool, blockId);
                poolBalance = balanceResult.Data;
            }

            var recentTransactions = await _uow.FinancialTransactions.GetRecentTransactionsAsync(role, blockId, 5);
            var transactionDocs = recentTransactions.Select(t => new { t.Description, t.Amount, t.TransactionType, Date = t.TransactionDate.ToString("dd.MM.yyyy") }).ToList();

            var elections = await _uow.Elections.GetElectionsWithCandidatesAsync(null, null);
            var activeElections = elections
                .Where(e => !e.IsCompleted && (e.Scope == ElectionScope.Site || (e.Scope == ElectionScope.Block && e.BlockId == blockId)))
                .Select(e => new { e.Id, e.Title, EndDate = e.EndDate.ToString("dd.MM.yyyy HH:mm") })
                .ToList();

            int totalResidents = 0;
            int totalStaff = 0;

            var allUsers = await _uow.Users.GetAllAsync();

            if (role == Role.BlockManager && blockId.HasValue)
            {
                totalResidents = allUsers.Count(u => (u.Role == Role.Owner || u.Role == Role.Tenant) && u.BlockId == blockId.Value);
                totalStaff = allUsers.Count(u => u.Role == Role.BlockStaff && u.BlockId == blockId.Value);
            }
            else 
            {
                totalResidents = allUsers.Count(u => u.Role == Role.Owner || u.Role == Role.Tenant);
                totalStaff = allUsers.Count(u => u.Role == Role.SiteManager || u.Role == Role.AssistantManager || u.Role == Role.BlockManager || u.Role == Role.SiteStaff || u.Role == Role.BlockStaff);
            }

            var blocksCount = (await _uow.Blocks.GetAllAsync()).Count();

            return Result<object>.Success(new
            {
                PoolBalance = poolBalance,
                RecentTransactions = transactionDocs,
                ActiveElections = activeElections,
                TotalResidents = totalResidents,
                TotalStaff = totalStaff,
                TotalBlocks = blocksCount
            });
        }
    }

    public class UserService : IUserService
    {
        private readonly IUnitOfWork _uow;
        public UserService(IUnitOfWork uow) { _uow = uow; }
        public async Task<Result<IEnumerable<object>>> GetAllUsersAsync()
        {
            var users = await _uow.Users.GetActiveUsersWithDetailsAsync();
            var results = users.Select(u => new
                {
                    u.Id,
                    FullName = u.FirstName + " " + u.LastName,
                    u.Role,
                    RoleName = u.Role.ToString(),
                    BlockName = u.Block != null ? u.Block.Name : "Atanmadı",
                    u.ApartmentNumber
                }).ToList();
            return Result<IEnumerable<object>>.Success(results.Cast<object>());
        }
    }

    public class BlockService : IBlockService
    {
        private readonly IUnitOfWork _uow;
        public BlockService(IUnitOfWork uow) { _uow = uow; }
        public async Task<Result<IEnumerable<object>>> GetBlocksAsync()
        {
            var blocks = await _uow.Blocks.GetAllAsync();
            var results = blocks.Select(b => new { id = b.Id, name = b.Name }).ToList();
            return Result<IEnumerable<object>>.Success(results.Cast<object>());
        }
    }
}
