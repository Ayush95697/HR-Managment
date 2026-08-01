using FluentValidation;

using HrSystem.Application.DTOs;
using HrSystem.Application.Validators.Common;

namespace HrSystem.Application.Validators.User;

public class UpdateProfileRequestValidator : AbstractValidator<UpdateProfileRequest>
{
    public UpdateProfileRequestValidator()
    {
        RuleFor(x => x.Name).ValidName();
        RuleFor(x => x.ThemePreference).NotEmpty().MaximumLength(20);
    }
}