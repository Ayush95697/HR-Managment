using FluentValidation;

using HrSystem.Application.DTOs;
using HrSystem.Application.Validators.Common;

namespace HrSystem.Application.Validators.Task;

public class CreateTaskCardRequestValidator : AbstractValidator<CreateTaskCardRequest>
{
    public CreateTaskCardRequestValidator()
    {
        RuleFor(x => x.ColumnId).NotEmpty().WithMessage("Column ID is required.");
        RuleFor(x => x.Title).ValidTitle();
    }
}