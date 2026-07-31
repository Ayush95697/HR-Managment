using FluentValidation;
using HrSystem.Application.DTOs;

namespace HrSystem.Application.Validators.Email;

public class SendEmailRequestValidator : AbstractValidator<SendEmailRequest>
{
    public SendEmailRequestValidator()
    {
        RuleFor(x => x.ToUserId).NotEmpty().WithMessage("Target user ID is required.");
        RuleFor(x => x.TemplateId).NotEmpty().WithMessage("Template ID is required.");
        RuleFor(x => x.IdempotencyKey).NotEmpty().WithMessage("Idempotency key is required.");
    }
}
