using HousingEstateManagement.Domain.Entities;
using HousingEstateManagement.Application.Interfaces.Repositories;
using HousingEstateManagement.Infrastructure.Persistence;

namespace HousingEstateManagement.Infrastructure.Repositories
{
    public class RecurringTransactionRepository : GenericRepository<RecurringTransaction>, IRecurringTransactionRepository
    {
        public RecurringTransactionRepository(AppDbContext context) : base(context) { }
    }
}
