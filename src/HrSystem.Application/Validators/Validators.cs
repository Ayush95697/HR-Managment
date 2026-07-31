using FluentValidation;
using HrSystem.Application.DTOs;

namespace HrSystem.Application.Validators;





public class CreateTaskCardRequestValidator : AbstractValidator<CreateTaskCardRequest>
{
    public CreateTaskCardRequestValidator()
    {
        RuleFor(x => x.ColumnId).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
    }
}

public class SendEmailRequestValidator : AbstractValidator<SendEmailRequest>
{
    public SendEmailRequestValidator()
    {
        RuleFor(x => x.ToUserId).NotEmpty();
        RuleFor(x => x.TemplateId).NotEmpty();
        RuleFor(x => x.IdempotencyKey).NotEmpty();
    }
}
