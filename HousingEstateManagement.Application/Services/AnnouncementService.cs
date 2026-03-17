using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HousingEstateManagement.Domain.Entities;
using HousingEstateManagement.Domain.Enums;
using HousingEstateManagement.Domain.Common;
using HousingEstateManagement.Application.Interfaces.Services;
using HousingEstateManagement.Application.Interfaces.Repositories;

namespace HousingEstateManagement.Application.Services
{
    public class AnnouncementService : IAnnouncementService
    {
        private readonly IUnitOfWork _uow;

        public AnnouncementService(IUnitOfWork uow)
        {
            _uow = uow;
        }

        public async Task<Result<int>> CreateAnnouncementAsync(string title, string content, AnnouncementTarget target, int? targetBlockId, Guid createdById)
        {
            var announcement = new Announcement
            {
                Title = title,
                Content = content,
                TargetScope = target,
                TargetBlockId = targetBlockId,
                CreatedDate = DateTime.UtcNow,
                CreatedById = createdById
            };

            await _uow.Announcements.AddAsync(announcement);
            await _uow.SaveChangesAsync();

            return Result<int>.Success(announcement.Id, "Duyuru başarıyla oluşturuldu.");
        }

        public async Task<Result<IEnumerable<object>>> GetAnnouncementsAsync(Role viewerRole, int? blockId)
        {
            var announcements = await _uow.Announcements.GetAnnouncementsWithDetailsAsync();

            IEnumerable<Announcement> filtered;

            if (viewerRole == Role.SiteManager || viewerRole == Role.AssistantManager)
            {
                filtered = announcements;
            }
            else if (viewerRole == Role.SiteStaff)
            {
                filtered = announcements.Where(a => a.TargetScope == AnnouncementTarget.SiteLevel || 
                                         (a.TargetScope == AnnouncementTarget.StaffOnly && a.TargetBlockId == null));
            }
            else if (viewerRole == Role.BlockStaff || viewerRole == Role.BlockManager)
            {
                filtered = announcements.Where(a => 
                    a.TargetScope == AnnouncementTarget.SiteLevel || 
                    (a.TargetScope == AnnouncementTarget.BlockLevel && a.TargetBlockId == blockId) ||
                    (a.TargetScope == AnnouncementTarget.StaffOnly && a.TargetBlockId == blockId));
            }
            else 
            {
                filtered = announcements.Where(a => 
                    a.TargetScope == AnnouncementTarget.SiteLevel || 
                    (a.TargetScope == AnnouncementTarget.BlockLevel && a.TargetBlockId == blockId));
            }

            var results = filtered.Select(a => new
                {
                    a.Id,
                    a.Title,
                    a.Content,
                    Scope = a.TargetScope,
                    BlockName = a.TargetBlock != null ? a.TargetBlock.Name : null,
                    Date = a.CreatedDate.ToString("dd.MM.yyyy HH:mm"),
                    CreatedBy = a.CreatedBy != null ? a.CreatedBy.FirstName + " " + a.CreatedBy.LastName : "Sistem",
                    CreatedByRole = a.CreatedBy != null ? (int)a.CreatedBy.Role : 0
                }).ToList();

            return Result<IEnumerable<object>>.Success(results.Cast<object>());
        }

        public async Task<Result> UpdateAnnouncementAsync(int id, string title, string content, AnnouncementTarget target, int? targetBlockId)
        {
            var ann = await _uow.Announcements.GetByIdAsync(id);
            if (ann == null) return Result.Failure("Duyuru bulunamadı.");

            ann.Title = title;
            ann.Content = content;
            ann.TargetScope = target;
            ann.TargetBlockId = target == AnnouncementTarget.BlockLevel ? targetBlockId : null;

            await _uow.SaveChangesAsync();
            return Result.Success("Duyuru güncellendi.");
        }

        public async Task<Result> DeleteAnnouncementAsync(int id)
        {
            var ann = await _uow.Announcements.GetByIdAsync(id);
            if (ann == null) return Result.Failure("Duyuru bulunamadı.");

            _uow.Announcements.Delete(ann);
            await _uow.SaveChangesAsync();
            return Result.Success("Duyuru silindi.");
        }
    }
}
