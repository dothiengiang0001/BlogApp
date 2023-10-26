using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using static TeduBlog.Core.SeedWorks.Constants.Permissions;
using TeduBlog.Api.Filters;
using TeduBlog.Core.Domain.Identity;
using TeduBlog.Core.Models;
using TeduBlog.Core.SeedWorks.Constants;
using Microsoft.EntityFrameworkCore;
using TeduBlog.Api.Extensions;
using TeduBlog.Core.Models.System.Requests;
using TeduBlog.Core.Models.System.Dtos;
using TeduBlog.Data.Persistence;
using System.Runtime.CompilerServices;
using TeduBlog.Core.Ultilities;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.Linq;

namespace TeduBlog.Api.Controllers.AdminApi
{
    [Route("api/admin/user")]
    public class UserController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly UserManager<AppUser> _userManager;
        private readonly TeduBlogContext _teduBlogContext;

        public UserController(UserManager<AppUser> userManager, IMapper mapper, TeduBlogContext teduBlogContext)
        {
            _mapper = mapper;
            _userManager = userManager;
            _teduBlogContext = teduBlogContext;
        }

        [HttpGet("{id}")]
        [Authorize(Users.View)]
        public async Task<ActionResult<UserDto>> GetUserById(Guid id)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null)
            {
                return NotFound();
            }
            var userDto = _mapper.Map<AppUser, UserDto>(user);
            var roles = await _userManager.GetRolesAsync(user);
            userDto.Roles = roles;
            return Ok(userDto);
        }

        [HttpGet("paging")]
        [Authorize(Users.View)]
        public async Task<ActionResult<PagedResult<UserDto>>> GetAllUsersPaging(string? sortField, int sortOrder, string? keyword, int pageIndex, int pageSize)
        {
            var query = _userManager.Users;

            /** SORT **/
            // Default
            if (string.IsNullOrEmpty(sortField))
            {
                query = query.OrderByDescending(x => x.DateCreated);
            }
            else
            {
                switch (sortOrder)
                {
                    case 1:
                        {
                            query = query.OrderBy(x => EF.Property<object>(x, sortField));
                            break;
                        }

                    case -1:
                        {
                            query = query.OrderByDescending(x => EF.Property<object>(x, sortField));
                            break;
                        }
                    default:
                        break;
                }
            }

            // Finding
            if (!string.IsNullOrEmpty(keyword))
            {
                query = query.Where(x => x.FirstName.Contains(keyword)
                                         || x.UserName.Contains(keyword)
                                         || x.Email.Contains(keyword)
                                         || x.PhoneNumber.Contains(keyword));
            }

            // Paging
            var totalRow = await query.CountAsync();
            query = query
               .Skip((pageIndex - 1) * pageSize)
               .Take(pageSize);

            // Return results
            var pagedResponse = new PagedResult<UserDto>
            {
                Results = await _mapper.ProjectTo<UserDto>(query).ToListAsync(),
                CurrentPage = pageIndex,
                RowCount = totalRow,
                PageSize = pageSize
            };
            return Ok(pagedResponse);
        }

        [HttpPost]
        [ValidateModel]
        [Authorize(Users.Create)]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
        {
            if ((await _userManager.FindByNameAsync(request.UserName)) != null)
            {
                return BadRequest();
            }

            if ((await _userManager.FindByEmailAsync(request.Email)) != null)
            {
                return BadRequest();
            }
            var user = _mapper.Map<CreateUserRequest, AppUser>(request);

            var result = await _userManager.CreateAsync(user, request.Password);
            await _userManager.SetLockoutEnabledAsync(user, false);
            await _teduBlogContext.SaveChangesAsync();

            if (result.Succeeded)
            {
                return Ok();
            }

            return BadRequest(string.Join("<br>", result.Errors.Select(x => x.Description)));
        }

        [HttpPut("{id}")]
        [ValidateModel]
        [Authorize(Users.Edit)]
        public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserRequest request)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null)
            {
                return NotFound();
            }
            _mapper.Map(request, user);
            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
            {
                return BadRequest(string.Join("<br>", result.Errors.Select(x => x.Description)));
            }
            return Ok();
        }

        [HttpPut("password-change-current-user")]
        [ValidateModel]
        public async Task<IActionResult> ChangeMyPassWord([FromBody] ChangeMyPasswordRequest request)
        {
            var user = await _userManager.FindByIdAsync(User.GetUserId().ToString());
            if (user == null)
            {
                return NotFound();
            }
            var result = await _userManager.ChangePasswordAsync(user, request.OldPassword, request.NewPassword);
            if (!result.Succeeded)
            {
                return BadRequest(string.Join("<br>", result.Errors.Select(x => x.Description)));
            }
            return Ok();
        }

        [HttpDelete]
        [Authorize(Users.Delete)]
        public async Task<IActionResult> DeleteUsers([FromQuery] string[] ids)
        {
            foreach (var id in ids)
            {
                var user = await _userManager.FindByIdAsync(id);
                if (user == null)
                {
                    return NotFound();
                }
                await _userManager.DeleteAsync(user);
            }
            return Ok();
        }


        [HttpPost("set-password/{id}")]
        [Authorize(Users.Edit)]
        public async Task<IActionResult> SetPassword(Guid id, [FromBody] SetPasswordRequest model)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null)
            {
                return NotFound();
            }
            user.PasswordHash = _userManager.PasswordHasher.HashPassword(user, model.NewPassword);
            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                return BadRequest(string.Join("<br>", result.Errors.Select(x => x.Description)));
            }
            return Ok();
        }

        [HttpPost("change-email/{id}")]
        [Authorize(Users.Edit)]
        public async Task<IActionResult> ChangeEmail(Guid id, [FromBody] ChangeEmailRequest request)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null)
            {
                return NotFound();
            }
            var token = await _userManager.GenerateChangeEmailTokenAsync(user, request.Email);
            var result = await _userManager.ChangeEmailAsync(user, request.Email, token);
            if (!result.Succeeded)
            {
                return BadRequest(string.Join("<br>", result.Errors.Select(x => x.Description)));
            }
            return Ok();
        }

        [HttpPut("{id}/assign-users")]
        [ValidateModel]
        [Authorize(Permissions.Users.Edit)]
        public async Task<IActionResult> AssignRolesToUser(string id, [FromBody] string[] roles)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                return NotFound();
            }
            var currentRoles = await _userManager.GetRolesAsync(user);
            var removedResult = await _userManager.RemoveFromRolesAsync(user, currentRoles);
            var addedResult = await _userManager.AddToRolesAsync(user, roles);
            if (!addedResult.Succeeded || !removedResult.Succeeded)
            {
                List<IdentityError> addedErrorList = addedResult.Errors.ToList();
                List<IdentityError> removedErrorList = removedResult.Errors.ToList();
                var errorList = new List<IdentityError>();
                errorList.AddRange(addedErrorList);
                errorList.AddRange(removedErrorList);

                return BadRequest(string.Join("<br/>", errorList.Select(x => x.Description)));
            }
            return Ok();
        }
    }
}