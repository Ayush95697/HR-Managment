using FluentValidation;

using HrSystem.Application.DTOs;
using HrSystem.Application.Validators.Common;

namespace HrSystem.Application.Validators.Board;

public class CreateColumnRequestValidator : AbstractValidator<CreateColumnRequest>
{
    public CreateColumnRequestValidator()
    {
        RuleFor(x => x.Name).ValidName();
        RuleFor(x => x.Order).GreaterThanOrEqualTo(0);
    }
}