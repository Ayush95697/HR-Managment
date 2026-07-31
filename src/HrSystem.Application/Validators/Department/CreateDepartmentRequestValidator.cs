using FluentValidation;
using HrSystem.Application.DTOs;
using HrSystem.Application.Validators.Common;

namespace HrSystem.Application.Validators.Department;

public class CreateDepartmentRequestValidator : AbstractValidator<CreateDepartmentRequest>
{
    public CreateDepartmentRequestValidator()
    {
        RuleFor(x => x.Name).ValidName();
    }
}
