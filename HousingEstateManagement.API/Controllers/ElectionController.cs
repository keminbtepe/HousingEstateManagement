using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using HousingEstateManagement.Application.Interfaces.Services;
using HousingEstateManagement.Domain.Enums;
using HousingEstateManagement.Domain.Common;

namespace HousingEstateManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ElectionController : ControllerBase
    {
        private readonly IElectionService _electionService;

        public ElectionController(IElectionService electionService)
        {
            _electionService = electionService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateElection([FromBody] CreateElectionDto dto)
        {
            var result = await _electionService.CreateElectionAsync(
                dto.Title, dto.Description, (ElectionType)dto.Type, dto.StartDate, dto.EndDate, 
                (ElectionScope)dto.Scope, dto.BlockId, (VoterEligibility)dto.VoterEligibility, 
                dto.CreatedByRole, dto.CandidateUserIds, dto.CandidateNames);
            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateElection(int id, [FromBody] CreateElectionDto dto)
        {
            var result = await _electionService.UpdateElectionAsync(
                id, dto.Title, dto.Description, dto.StartDate, dto.EndDate, dto.Type, dto.CandidateUserIds, dto.CandidateNames);
            return Ok(result);
        }

        [HttpGet("candidates")]
        public async Task<IActionResult> GetPotentialCandidates([FromQuery] int scope, [FromQuery] int? blockId)
        {
            var result = await _electionService.GetPotentialCandidatesAsync((ElectionScope)scope, blockId);
            return Ok(result);
        }

        [HttpGet("list")]
        public async Task<IActionResult> GetElections([FromQuery] int scope, [FromQuery] int? blockId, [FromQuery] Guid? userId)
        {
            var result = await _electionService.GetElectionsAsync((ElectionScope)scope, blockId, userId);
            return Ok(result);
        }

        [HttpPost("vote")]
        public async Task<IActionResult> Vote([FromBody] VoteDto dto)
        {
            var result = await _electionService.VoteAsync(dto.ElectionId, dto.CandidateId, dto.VoterUserId);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteElection(int id)
        {
            var result = await _electionService.DeleteElectionAsync(id);
            return Ok(result);
        }

        [HttpPost("seed-demo")]
        public async Task<IActionResult> SeedDemoElections()
        {
            var result = await _electionService.SeedDemoElectionsAsync();
            return Ok(result);
        }
    }

    public class VoteDto
    {
        public int ElectionId { get; set; }
        public int CandidateId { get; set; }
        public Guid VoterUserId { get; set; }
    }

    public class CreateElectionDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int Type { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int Scope { get; set; }
        public int? BlockId { get; set; }
        public int VoterEligibility { get; set; }
        public int CreatedByRole { get; set; }
        public List<Guid> CandidateUserIds { get; set; } = new List<Guid>();
        public List<string> CandidateNames { get; set; } = new List<string>();
    }
}
