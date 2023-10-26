using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TeduBlog.Core.Models.System.Requests
{
    public class CreateUpdateRoleRequest
    {
        [Required(ErrorMessage = "Name must be require")]
        public string Name { get; set; }

        [Required(ErrorMessage = "DisplayName must be require")]
        public string DisplayName { get; set; }
    }
}
