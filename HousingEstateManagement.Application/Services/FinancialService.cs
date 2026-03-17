using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HousingEstateManagement.Domain.Entities;
using HousingEstateManagement.Domain.Enums;
using HousingEstateManagement.Domain.Common;
using HousingEstateManagement.Application.Interfaces.Services;
using HousingEstateManagement.Application.Interfaces.Repositories;
using HousingEstateManagement.Application.DTOs;
using AutoMapper;

namespace HousingEstateManagement.Application.Services
{
    public class FinancialService : IFinancialService
    {
        private readonly IUnitOfWork _uow;
        private readonly IMapper _mapper;

        public FinancialService(IUnitOfWork uow, IMapper mapper)
        {
            _uow = uow;
            _mapper = mapper;
        }

        public async Task<Result<decimal>> GetPoolBalanceAsync(TargetPool poolType, int? blockId = null)
        {
            var transactions = await _uow.FinancialTransactions.GetAllAsync();
            var query = transactions.Where(t => t.TargetPool == poolType);
            
            if (poolType == TargetPool.BlockPool && blockId.HasValue)
            {
                query = query.Where(t => t.BlockId == blockId.Value);
            }

            var income = query.Where(t => t.TransactionType == TransactionType.Income).Sum(t => t.Amount);
            var expense = query.Where(t => t.TransactionType == TransactionType.Expense).Sum(t => t.Amount);

            return Result<decimal>.Success(income - expense);
        }

        public async Task<Result> ProcessTransactionAsync(string description, decimal amount, TransactionType type, TargetPool targetPool, int? blockId = null, Guid? performedBy = null, bool isAutomatic = false)
        {
            var transaction = new FinancialTransaction
            {
                Description = description,
                Amount = amount,
                TransactionType = type,
                TransactionDate = DateTime.UtcNow,
                TargetPool = targetPool,
                BlockId = blockId,
                IsAutomatic = isAutomatic,
                PerformedById = performedBy
            };

            await _uow.FinancialTransactions.AddAsync(transaction);
            await _uow.SaveChangesAsync();
            return Result.Success();
        }

        public async Task<Result<IEnumerable<FinancialTransactionDto>>> GetLedgerAsync(TargetPool poolType, int? blockId = null)
        {
            var results = await _uow.FinancialTransactions.GetAllAsync();
            var query = results.Where(t => t.TargetPool == poolType);
            
            if (poolType == TargetPool.BlockPool && blockId.HasValue)
            {
                query = query.Where(t => t.BlockId == blockId.Value);
            }

            var sorted = query.OrderByDescending(t => t.TransactionDate).ToList();
            var dtos = _mapper.Map<IEnumerable<FinancialTransactionDto>>(sorted);
            return Result<IEnumerable<FinancialTransactionDto>>.Success(dtos);
        }

        public async Task<Result> UpdateTransactionAsync(int id, string description, decimal amount, TransactionType type, TargetPool targetPool, int? blockId = null, Guid? performedBy = null)
        {
            var entity = await _uow.FinancialTransactions.GetByIdAsync(id);
            if (entity == null) return Result.Failure("İşlem bulunamadı.");

            entity.Description = description;
            entity.Amount = amount;
            entity.TransactionType = type;
            entity.TargetPool = targetPool;
            entity.BlockId = targetPool == TargetPool.BlockPool ? blockId : null;
            if (performedBy.HasValue && performedBy.Value != Guid.Empty)
                entity.PerformedById = performedBy;

            await _uow.SaveChangesAsync();
            return Result.Success("İşlem başarıyla güncellendi.");
        }

        public async Task<Result> DeleteTransactionAsync(int id)
        {
            var entity = await _uow.FinancialTransactions.GetByIdAsync(id);
            if (entity == null) return Result.Failure("İşlem bulunamadı.");

            _uow.FinancialTransactions.Delete(entity);
            await _uow.SaveChangesAsync();
            return Result.Success("İşlem başarıyla silindi.");
        }

        public async Task<Result> AddRecurringTransactionAsync(string description, decimal amount, TransactionType type, TargetPool targetPool, int executionDay, DateTime? endDate, int? blockId = null)
        {
            var recurring = new RecurringTransaction
            {
                Description = description,
                Amount = amount,
                TransactionType = type,
                TargetPool = targetPool,
                BlockId = blockId,
                DayOfMonth = executionDay,
                EndDate = endDate,
                NextExecutionDate = DateTime.UtcNow,
                IsActive = true
            };
            
            await _uow.RecurringTransactions.AddAsync(recurring);
            await _uow.SaveChangesAsync();
            return Result.Success("Otomatik işlem talimatı kaydedildi.");
        }

        public async Task<Result<IEnumerable<object>>> GetRecurringTransactionsAsync(int? blockId = null)
        {
            var results = await _uow.RecurringTransactions.GetAllAsync();
            var query = results.AsQueryable();
            if (blockId.HasValue)
            {
                query = query.Where(r => r.TargetPool == TargetPool.BlockPool && r.BlockId == blockId.Value);
            }

            var sorted = query.OrderByDescending(r => r.Id).ToList();
            return Result<IEnumerable<object>>.Success(sorted.Cast<object>());
        }

        public async Task<Result> UpdateRecurringAsync(int id, string description, decimal amount, TransactionType type, TargetPool targetPool, int executionDay, DateTime? endDate, int? blockId = null)
        {
            var entity = await _uow.RecurringTransactions.GetByIdAsync(id);
            if (entity == null) return Result.Failure("Talimat bulunamadı.");

            entity.Description = description;
            entity.Amount = amount;
            entity.TransactionType = type;
            entity.TargetPool = targetPool;
            entity.BlockId = blockId;
            entity.DayOfMonth = executionDay;
            entity.EndDate = endDate;

            await _uow.SaveChangesAsync();
            return Result.Success("Talimat güncellendi.");
        }

        public async Task<Result> DeleteRecurringAsync(int id)
        {
            var entity = await _uow.RecurringTransactions.GetByIdAsync(id);
            if (entity == null) return Result.Failure("Talimat bulunamadı.");

            _uow.RecurringTransactions.Delete(entity);
            await _uow.SaveChangesAsync();
            return Result.Success("Talimat silindi.");
        }
    }
}
