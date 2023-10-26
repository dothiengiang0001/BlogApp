using System.ComponentModel.DataAnnotations;

namespace TeduBlog.Core.Models.Auth.Requests
{
    public class TokenRequest
    {
        [Required(ErrorMessage = "Access token must be require")]
        public string AccessToken { get; set; }

        [Required(ErrorMessage = "Refresh token must be require")]
        public string RefreshToken { get; set; }
    }
}
