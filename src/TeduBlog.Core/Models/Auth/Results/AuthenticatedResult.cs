namespace TeduBlog.Core.Models.Auth.Results
{
    public class AuthenticatedResult
    {
        public required string Token { get; set; }
        public required string RefreshToken { get; set; }
    }
}
