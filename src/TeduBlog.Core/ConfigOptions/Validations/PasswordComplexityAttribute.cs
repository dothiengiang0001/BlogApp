using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace TeduBlog.Core.ConfigOptions.Validations
{
    public class PasswordComplexityAttribute : ValidationAttribute
    {
        public override bool IsValid(object value)
        {
            if (value is string password)
            {
                // Kiểm tra xem mật khẩu có ít nhất 8 ký tự
                if (password.Length < 8)
                    return false;

                // Kiểm tra xem mật khẩu có ít nhất 1 số
                if (!Regex.IsMatch(password, @"\d"))
                    return false;

                // Kiểm tra xem mật khẩu có ít nhất 1 ký tự đặc biệt
                if (!Regex.IsMatch(password, @"[!@#$%^&*()]"))
                    return false;

                // Kiểm tra xem mật khẩu có ít nhất 1 chữ hoa
                if (!Regex.IsMatch(password, @"[A-Z]"))
                    return false;
            }

            return true;
        }
    }
}
