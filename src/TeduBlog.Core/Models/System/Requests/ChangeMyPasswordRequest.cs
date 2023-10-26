using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TeduBlog.Core.Models.System.Requests
{
    public class ChangeMyPasswordRequest
    {
        [Required(ErrorMessage = "OldPassword must be require")]
        public string OldPassword { get; set; }

        [Required(ErrorMessage = "NewPassword must be require")]
        public string NewPassword { get; set; }
    }
}
