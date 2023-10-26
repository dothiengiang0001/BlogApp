using System.ComponentModel.DataAnnotations;

namespace TeduBlog.Core.Models.System.Requests
{
    public class ChangeEmailRequest
    {
        [Required(ErrorMessage = "Email must be require")]
        public string Email { get; set; }
    }
}
