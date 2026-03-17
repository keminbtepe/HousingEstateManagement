using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using HousingEstateManagement.Application.Interfaces.Services;
using HousingEstateManagement.Application.Interfaces.Repositories;
using HousingEstateManagement.Domain.Enums;
using HousingEstateManagement.Domain.Common;

namespace HousingEstateManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FinancialController : ControllerBase
    {
        private readonly IFinancialService _financialService;

        public FinancialController(IFinancialService financialService)
        {
            _financialService = financialService;
        }

        [HttpPost("transaction")]
        public async Task<IActionResult> AddManualTransaction([FromBody] CreateTransactionDto dto)
        {
            var result = await _financialService.ProcessTransactionAsync(
                dto.Description,
                dto.Amount,
                (TransactionType)dto.TransactionType,
                (TargetPool)dto.TargetPool,
                dto.BlockId,
                dto.PerformedById);

            return Ok(result);
        }

        [HttpPut("transaction/{id}")]
        public async Task<IActionResult> UpdateManualTransaction(int id, [FromBody] CreateTransactionDto dto)
        {
            var result = await _financialService.UpdateTransactionAsync(
                id,
                dto.Description,
                dto.Amount,
                (TransactionType)dto.TransactionType,
                (TargetPool)dto.TargetPool,
                dto.BlockId,
                dto.PerformedById);

            return Ok(result);
        }

        [HttpDelete("transaction/{id}")]
        public async Task<IActionResult> DeleteManualTransaction(int id)
        {
            var result = await _financialService.DeleteTransactionAsync(id);
            return Ok(result);
        }

        [HttpPost("recurring")]
        public async Task<IActionResult> AddRecurringTransaction([FromBody] CreateRecurringTransactionDto dto)
        {
            var result = await _financialService.AddRecurringTransactionAsync(
                dto.Description,
                dto.Amount,
                (TransactionType)dto.TransactionType,
                (TargetPool)dto.TargetPool,
                dto.ExecutionDay,
                dto.EndDate,
                dto.BlockId);

            return Ok(result);
        }

        [HttpGet("recurring")]
        public async Task<IActionResult> GetRecurringTransactions([FromQuery] int? blockId)
        {
            var result = await _financialService.GetRecurringTransactionsAsync(blockId);
            return Ok(result);
        }

        [HttpPut("recurring/{id}")]
        public async Task<IActionResult> UpdateRecurringTransaction(int id, [FromBody] CreateRecurringTransactionDto dto)
        {
            var result = await _financialService.UpdateRecurringAsync(
                id,
                dto.Description,
                dto.Amount,
                (TransactionType)dto.TransactionType,
                (TargetPool)dto.TargetPool,
                dto.ExecutionDay,
                dto.EndDate,
                dto.BlockId);

            return Ok(result);
        }

        [HttpDelete("recurring/{id}")]
        public async Task<IActionResult> DeleteRecurringTransaction(int id)
        {
            var result = await _financialService.DeleteRecurringAsync(id);
            return Ok(result);
        }

        [HttpGet("ledgers")]
        public async Task<IActionResult> GetLedgers([FromQuery] int role, [FromQuery] int? blockId)
        {
            var resultList = new List<object>();

            if (role == (int)Role.SiteManager)
            {
                // Site pool
                var siteBalance = await _financialService.GetPoolBalanceAsync(TargetPool.SitePool, null);
                var siteLedger = await _financialService.GetLedgerAsync(TargetPool.SitePool, null);
                resultList.Add(new { PoolName = "Site Yönetim Kasası (Genel)", Balance = siteBalance.Data, Transactions = siteLedger.Data, PoolType = 1, BlockId = (int?)null });

                // All block pools - use IUnitOfWork directly to avoid dynamic binding issues
                var blocks = await HttpContext.RequestServices.GetRequiredService<IUnitOfWork>().Blocks.GetAllAsync();
                foreach (var block in blocks)
                {
                    var bBalance = await _financialService.GetPoolBalanceAsync(TargetPool.BlockPool, block.Id);
                    var bLedger = await _financialService.GetLedgerAsync(TargetPool.BlockPool, block.Id);
                    resultList.Add(new { PoolName = $"{block.Name} Kasası", Balance = bBalance.Data, Transactions = bLedger.Data, PoolType = 2, BlockId = (int?)block.Id });
                }
            }
            else if (blockId.HasValue)
            {
                var blockBalance = await _financialService.GetPoolBalanceAsync(TargetPool.BlockPool, blockId.Value);
                var blockLedger = await _financialService.GetLedgerAsync(TargetPool.BlockPool, blockId.Value);
                resultList.Add(new { PoolName = "Blok Kasası", Balance = blockBalance.Data, Transactions = blockLedger.Data, PoolType = 2, BlockId = blockId.Value });
            }

            return Ok(Result<List<object>>.Success(resultList));
        }
    }

    public class CreateTransactionDto
    {
        public string Description { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public int TransactionType { get; set; } 
        public int TargetPool { get; set; } 
        public int? BlockId { get; set; }
        public Guid PerformedById { get; set; }
    }

    public class CreateRecurringTransactionDto
    {
        public string Description { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public int TransactionType { get; set; }
        public int TargetPool { get; set; }
        public int? BlockId { get; set; }
        public int ExecutionDay { get; set; }
        public DateTime EndDate { get; set; }
        public Guid CreatedById { get; set; }
    }
}
