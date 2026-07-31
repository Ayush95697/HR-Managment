using FluentValidation;
using HrSystem.Application.DTOs;
using HrSystem.Application.Validators.Common;

namespace HrSystem.Application.Validators.User;

public class ChangePasswordRequestValidator : AbstractValidator<ChangePasswordRequest>
{
    public ChangePasswordRequestValidator()
    {
        RuleFor(x => x.CurrentPassword).NotEmpty().WithMessage("Current password is required.");
        RuleFor(x => x.NewPassword).ValidPassword();
    }
}
