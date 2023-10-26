using Microsoft.EntityFrameworkCore;
using TeduBlog.Data.Persistence;

namespace TeduBlog.Api
{
    public static class MigrationManager
    {
        public static async Task<WebApplication> MigrateDatabaseAsync(this WebApplication app)
        {
            using(var scope = app.Services.CreateScope())
            {
                using (var context = scope.ServiceProvider.GetRequiredService<TeduBlogContext>())
                {
                    context.Database.Migrate();
                    await new TeduBlogContextSeed().SeedAsync(context);
                }
            }
            return app;
        }
    }
}
