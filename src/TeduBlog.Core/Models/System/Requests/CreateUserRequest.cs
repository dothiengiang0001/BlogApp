using AutoMapper;
using System.ComponentModel.DataAnnotations;
using TeduBlog.Core.ConfigOptions.Validations;
using TeduBlog.Core.Domain.Identity;

namespace TeduBlog.Core.Models.System.Requests
{
    public class CreateUserRequest
    {
        [Required(ErrorMessage = "First name must be require")]
        public string FirstName { get; set; }

        [Required(ErrorMessage = "Last name must be require")]
        public string LastName { get; set; }

        [Required(ErrorMessage = "User name must be require")]
        public string UserName { get; set; }

        [Required(ErrorMessage = "Email must be require")]
        [EmailAddress(ErrorMessage = "Email is invalid")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Phone number must be require")]
        [Phone(ErrorMessage = "Phone number is invalid")]
        public string PhoneNumber { get; set; }

        [Required(ErrorMessage = "Password must be require")]
        [PasswordComplexity]
        public string Password { get; set; }

        [DateNotInFutureAttribute]
        public DateTime? Dob { get; set; }

        public string? Avatar { get; set; }

        [Required(ErrorMessage = "Status must be require")]
        public bool IsActive { get; set; }

        public class AutoMapperProfiles : Profile
        {
            public AutoMapperProfiles()
            {
                CreateMap<CreateUserRequest, AppUser>();
            }
        }
    }
}
