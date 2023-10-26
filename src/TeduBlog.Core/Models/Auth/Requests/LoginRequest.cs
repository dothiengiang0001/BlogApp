using System.ComponentModel.DataAnnotations;

namespace TeduBlog.Core.Models.Auth.Requests
{
    public class LoginRequest
    {
        [Required(ErrorMessage = "User name must be require")]
        public string UserName { get; set; }

        [Required(ErrorMessage = "Password must be require")]
        public string Password { get; set; }
    }
}
