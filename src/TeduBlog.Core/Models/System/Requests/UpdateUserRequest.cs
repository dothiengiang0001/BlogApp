using AutoMapper;
using System.ComponentModel.DataAnnotations;
using TeduBlog.Core.ConfigOptions.Validations;
using TeduBlog.Core.Domain.Identity;

namespace TeduBlog.Core.Models.System.Requests
{
    public class UpdateUserRequest
    {
        [Required(ErrorMessage = "NewPassword must be require")]
        public string FirstName { get; set; }

        [Required(ErrorMessage = "LastName must be require")]
        public string LastName { get; set; }

        [Required(ErrorMessage = "PhoneNumber must be require")]
        [Phone(ErrorMessage = "Phone number is invalid")]
        public string PhoneNumber { get; set; }

        [DateNotInFuture]
        public DateTime? Dob { get; set; }
        
        public string? Avatar { get; set; }

        [Required(ErrorMessage = "IsActive must be require")]
        public bool IsActive { get; set; }

        public class AutoMapperProfiles : Profile
        {
            public AutoMapperProfiles()
            {
                CreateMap<UpdateUserRequest, AppUser>();
            }
        }
    }
}
