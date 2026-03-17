using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using HousingEstateManagement.Infrastructure.Persistence;
using HousingEstateManagement.Application.Interfaces.Services;
using HousingEstateManagement.Domain.Enums;

namespace HousingEstateManagement.API.Services.Background
{
    public class FinancialBackgroundService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<FinancialBackgroundService> _logger;

        public FinancialBackgroundService(IServiceProvider serviceProvider, ILogger<FinancialBackgroundService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using (var scope = _serviceProvider.CreateScope())
                    {
                        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                        var financialService = scope.ServiceProvider.GetRequiredService<IFinancialService>();

                        var pendingTransactions = await context.RecurringTransactions
                            .Where(rt => rt.IsActive && rt.NextExecutionDate <= DateTime.UtcNow)
                            .ToListAsync(stoppingToken);

                        foreach (var rt in pendingTransactions)
                        {
                            if (rt.EndDate.HasValue && DateTime.UtcNow.Date > rt.EndDate.Value.Date)
                            {
                                rt.IsActive = false;
                                continue;
                            }

                            await financialService.ProcessTransactionAsync(
                                description: rt.Description + " (Otomatik İşlem)",
                                amount: rt.Amount,
                                type: rt.TransactionType,
                                targetPool: rt.TargetPool,
                                blockId: rt.BlockId,
                                isAutomatic: true
                            );

                            // Set Next Execution Date to next month
                            rt.NextExecutionDate = GetNextExecutionDate(rt.DayOfMonth);
                        }

                        if (pendingTransactions.Any())
                        {
                            await context.SaveChangesAsync(stoppingToken);
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred executing Financial Background Service.");
                }

                // Check every hour
                await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
            }
        }

        private DateTime GetNextExecutionDate(int targetDay)
        {
            var now = DateTime.UtcNow;
            int daysInCurrentMonth = DateTime.DaysInMonth(now.Year, now.Month);
            int dayToUse = Math.Min(targetDay, daysInCurrentMonth);

            DateTime potentialNextDate = new DateTime(now.Year, now.Month, dayToUse);

            if (potentialNextDate <= now)
            {
                var nextMonth = now.AddMonths(1);
                int daysInNextMonth = DateTime.DaysInMonth(nextMonth.Year, nextMonth.Month);
                int nextMonthDayToUse = Math.Min(targetDay, daysInNextMonth);
                return new DateTime(nextMonth.Year, nextMonth.Month, nextMonthDayToUse);
            }

            return potentialNextDate;
        }
    }
}
