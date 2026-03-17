using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HousingEstateManagement.Domain.Common;
using HousingEstateManagement.Application.DTOs;
using HousingEstateManagement.Domain.Enums;

namespace HousingEstateManagement.Application.Interfaces.Services
{
    public interface IAnnouncementService
    {
        Task<Result<int>> CreateAnnouncementAsync(string title, string content, AnnouncementTarget target, int? targetBlockId, Guid createdById);
        Task<Result<IEnumerable<object>>> GetAnnouncementsAsync(Role viewerRole, int? blockId);
        Task<Result> UpdateAnnouncementAsync(int id, string title, string content, AnnouncementTarget target, int? targetBlockId);
        Task<Result> DeleteAnnouncementAsync(int id);
    }
}
