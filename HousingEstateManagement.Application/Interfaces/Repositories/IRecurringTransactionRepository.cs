using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HousingEstateManagement.Domain.Entities;

namespace HousingEstateManagement.Application.Interfaces.Repositories
{
    public interface IRecurringTransactionRepository : IGenericRepository<RecurringTransaction>
    {
    }
}
