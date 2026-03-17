using AutoMapper;
using HousingEstateManagement.Application.DTOs;
using HousingEstateManagement.Domain.Entities;

namespace HousingEstateManagement.Application.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<User, UserDto>().ReverseMap();
            CreateMap<Announcement, AnnouncementDto>().ReverseMap();
            CreateMap<FinancialTransaction, FinancialTransactionDto>().ReverseMap();
            CreateMap<Block, BlockDto>().ReverseMap();
        }
    }
}
