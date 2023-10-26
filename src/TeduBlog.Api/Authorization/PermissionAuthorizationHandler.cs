using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;
using TeduBlog.Core.Domain.Identity;
using TeduBlog.Core.SeedWorks.Constants;

namespace TeduBlog.Api.Authorization
{
    public class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
    {
        private readonly RoleManager<AppRole> _roleManager;
        private readonly UserManager<AppUser> _userManager;
        public PermissionAuthorizationHandler(RoleManager<AppRole> roleManager,
            UserManager<AppUser> userManager)
        {
            _roleManager = roleManager;
            _userManager = userManager;
        }

        // This funtion will be run when the request is called controller with Authorize Attribute
        protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, PermissionRequirement requirement)
        {
            // If user is not aithenticated, we will not allow access to the system 
            if (context.User.Identity.IsAuthenticated == false)
            {
                return;
            }

            // Coding below is to check current user if any roles and permission to access system
            var user = await _userManager.FindByNameAsync(context.User.Identity.Name); // Get current user data from name user (saved in claim identity)
            var roles = await _userManager.GetRolesAsync(user); // Get all roles of current user
            if (roles.Contains(Roles.Admin)) // The User is Admin => accept access system
            {
                context.Succeed(requirement);
                return;
            }
            var allPermissions = new List<Claim>();
            foreach (var role in roles) // Get all permission of current user
            {
                var roleEntity = await _roleManager.FindByNameAsync(role); ; // Get role data by role of current user
                var roleClaims = await _roleManager.GetClaimsAsync(roleEntity); // Get role claim
                allPermissions.AddRange(roleClaims); // Add to list

            }
            // Get all permissions of current user by => compare current data with permission requirement
            var permissions = allPermissions.Where(x => x.Type == "Permission" &&
                                                                x.Value == requirement.Permission &&
                                                                x.Issuer == "LOCAL AUTHORITY"); 
            // Allow access to the system
            if (permissions.Any())
            {
                context.Succeed(requirement);
                return;
            }
        }
    }
}
