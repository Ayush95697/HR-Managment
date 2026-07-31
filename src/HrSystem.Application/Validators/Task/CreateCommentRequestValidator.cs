using FluentValidation;
using HrSystem.Application.DTOs;

namespace HrSystem.Application.Validators.Task;

public class CreateCommentRequestValidator : AbstractValidator<CreateCommentRequest>
{
    public CreateCommentRequestValidator()
    {
        RuleFor(x => x.Body).NotEmpty().WithMessage("Comment body is required.")
                            .MaximumLength(2000).WithMessage("Comment must not exceed 2000 characters.");
    }
}
