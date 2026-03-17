using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using HousingEstateManagement.Application.Interfaces.Services;
using HousingEstateManagement.Domain.Enums;
using HousingEstateManagement.Domain.Common;

namespace HousingEstateManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnnouncementController : ControllerBase
    {
        private readonly IAnnouncementService _announcementService;

        public AnnouncementController(IAnnouncementService announcementService)
        {
            _announcementService = announcementService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateAnnouncement([FromBody] CreateAnnouncementDto dto)
        {
            var result = await _announcementService.CreateAnnouncementAsync(
                dto.Title, 
                dto.Content, 
                (AnnouncementTarget)dto.TargetScope, 
                dto.TargetBlockId, 
                dto.CreatedById);

            return Ok(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetAnnouncements([FromQuery] int viewerRole, [FromQuery] int? blockId)
        {
            var result = await _announcementService.GetAnnouncementsAsync((Role)viewerRole, blockId);
            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAnnouncement(int id, [FromBody] CreateAnnouncementDto dto)
        {
            var result = await _announcementService.UpdateAnnouncementAsync(
                id, 
                dto.Title, 
                dto.Content, 
                (AnnouncementTarget)dto.TargetScope, 
                dto.TargetBlockId);

            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAnnouncement(int id)
        {
            var result = await _announcementService.DeleteAnnouncementAsync(id);
            return Ok(result);
        }
    }

    public class CreateAnnouncementDto
    {
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public int TargetScope { get; set; }
        public int? TargetBlockId { get; set; }
        public Guid CreatedById { get; set; }
    }
}
