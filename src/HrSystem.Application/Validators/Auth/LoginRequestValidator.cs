using FluentValidation;
using HrSystem.Application.DTOs;
using HrSystem.Application.Validators.Common;

namespace HrSystem.Application.Validators.Auth;

public class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Email).ValidEmail();
        RuleFor(x => x.Password).NotEmpty();
    }
}
