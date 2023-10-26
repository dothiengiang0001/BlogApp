using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace TeduBlog.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HomeController : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult> Index()
        {
            return Redirect("/Swagger/index.html");
        }
    }
}
