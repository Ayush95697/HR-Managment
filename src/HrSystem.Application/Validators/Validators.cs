using FluentValidation;
using HrSystem.Application.DTOs;

namespace HrSystem.Application.Validators;







public class SendEmailRequestValidator : AbstractValidator<SendEmailRequest>
{
    public SendEmailRequestValidator()
    {
        RuleFor(x => x.ToUserId).NotEmpty();
        RuleFor(x => x.TemplateId).NotEmpty();
        RuleFor(x => x.IdempotencyKey).NotEmpty();
    }
}
