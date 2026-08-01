using FluentValidation;

using HrSystem.Application.DTOs;
using HrSystem.Application.Validators.Common;

namespace HrSystem.Application.Validators.Task;

public class PatchTaskCardRequestValidator : AbstractValidator<PatchTaskCardRequest>
{
    public PatchTaskCardRequestValidator()
    {
        RuleFor(x => x.Title).MaximumLength(200).When(x => x.Title != null);
        // Note: We don't enforce .NotEmpty() on Title here because it's a PATCH request,
        // and Title might be null if they're only updating the description.
        // The service layer ensures the final title isn't empty if provided.
        RuleFor(x => x.Description).MaximumLength(5000).When(x => x.Description != null);
    }
}