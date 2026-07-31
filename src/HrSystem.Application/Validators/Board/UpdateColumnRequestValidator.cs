using FluentValidation;
using HrSystem.Application.DTOs;
using HrSystem.Application.Validators.Common;

namespace HrSystem.Application.Validators.Board;

public class UpdateColumnRequestValidator : AbstractValidator<UpdateColumnRequest>
{
    public UpdateColumnRequestValidator()
    {
        RuleFor(x => x.Name).ValidName();
        RuleFor(x => x.Order).GreaterThanOrEqualTo(0).When(x => x.Order.HasValue);
    }
}
