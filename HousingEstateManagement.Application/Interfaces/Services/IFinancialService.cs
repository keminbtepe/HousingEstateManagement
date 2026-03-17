using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HousingEstateManagement.Domain.Entities;
using HousingEstateManagement.Domain.Enums;
using HousingEstateManagement.Domain.Common;
using HousingEstateManagement.Application.DTOs;

namespace HousingEstateManagement.Application.Interfaces.Services
{
    public interface IFinancialService
    {
        Task<Result<decimal>> GetPoolBalanceAsync(TargetPool poolType, int? blockId = null);
        Task<Result> ProcessTransactionAsync(string description, decimal amount, TransactionType type, TargetPool targetPool, int? blockId = null, Guid? performedBy = null, bool isAutomatic = false);
        Task<Result<IEnumerable<FinancialTransactionDto>>> GetLedgerAsync(TargetPool poolType, int? blockId = null);
        
        // Manual Transaction CRUD
        Task<Result> UpdateTransactionAsync(int id, string description, decimal amount, TransactionType type, TargetPool targetPool, int? blockId = null, Guid? performedBy = null);
        Task<Result> DeleteTransactionAsync(int id);

        // Recurring Transaction Methods
        Task<Result> AddRecurringTransactionAsync(string description, decimal amount, TransactionType type, TargetPool targetPool, int executionDay, DateTime? endDate, int? blockId = null);
        Task<Result<IEnumerable<object>>> GetRecurringTransactionsAsync(int? blockId = null);
        Task<Result> UpdateRecurringAsync(int id, string description, decimal amount, TransactionType type, TargetPool targetPool, int executionDay, DateTime? endDate, int? blockId = null);
        Task<Result> DeleteRecurringAsync(int id);
    }
}
