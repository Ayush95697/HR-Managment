using FluentValidation;
using HrSystem.Application.DTOs;
using HrSystem.Application.Validators.Common;

namespace HrSystem.Application.Validators.Board;

public class UpdateBoardRequestValidator : AbstractValidator<UpdateBoardRequest>
{
    public UpdateBoardRequestValidator()
    {
        RuleFor(x => x.Name).ValidName();
    }
}
