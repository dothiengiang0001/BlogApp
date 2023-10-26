using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static TeduBlog.Core.SeedWorks.Constants.Permissions;

namespace TeduBlog.Core.Ultilities
{
    public class Helper
    {
        // Hàm này giúp lấy giá trị của trường cụ thể từ một đối tượng User.
        public static object GetPropertyValue(object user, string propertyName)
        {
            var property = typeof(object).GetProperty(propertyName);
            if (property != null)
            {
                return property.GetValue(user);
            }
            return null;
        }
    }
}
