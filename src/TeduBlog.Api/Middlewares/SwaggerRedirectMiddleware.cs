namespace TeduBlog.Api.Middlewares
{
    public class SwaggerRedirectMiddleware
    {
        private readonly RequestDelegate _next;

        public SwaggerRedirectMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Kiểm tra điều kiện nếu bạn muốn chuyển hướng đến Swagger UI
            if (context.Request.Path == "/")
            {
                // Thực hiện chuyển hướng đến Swagger UI
                context.Response.Redirect("/swagger/index.html");
                return;
            }

            // Tiếp tục xử lý yêu cầu nếu không cần chuyển hướng
            await _next(context);
        }
    }
}
