using System.ComponentModel.DataAnnotations;

namespace TeduBlog.Core.ConfigOptions.Validations
{
    public class DateNotInFutureAttribute : ValidationAttribute
    {
        protected override ValidationResult IsValid(object value, ValidationContext validationContext)
        {
            if (value is DateTime date)
            {
                if (date > DateTime.Now)
                {
                    return new ValidationResult("Ngày không được lớn hơn ngày hiện tại.");
                }
            }
            return ValidationResult.Success;
        }
    }
}
