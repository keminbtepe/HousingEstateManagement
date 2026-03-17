using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HousingEstateManagement.Domain.Entities;
using HousingEstateManagement.Domain.Enums;

namespace HousingEstateManagement.Application.Interfaces.Repositories
{
    public interface IFinancialTransactionRepository : IGenericRepository<FinancialTransaction>
    {
        Task<IEnumerable<FinancialTransaction>> GetRecentTransactionsAsync(Role role, int? blockId, int count);
    }
}
