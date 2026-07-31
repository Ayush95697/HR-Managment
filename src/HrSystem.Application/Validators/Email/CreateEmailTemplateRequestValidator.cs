using FluentValidation;
using HrSystem.Application.DTOs;
using HrSystem.Application.Validators.Common;

namespace HrSystem.Application.Validators.Email;

public class CreateEmailTemplateRequestValidator : AbstractValidator<CreateEmailTemplateRequest>
{
    public CreateEmailTemplateRequestValidator()
    {
        RuleFor(x => x.Name).ValidName();
        RuleFor(x => x.Subject).ValidTitle();
        RuleFor(x => x.BodyHtml).NotEmpty().WithMessage("HTML body is required.")
                                .MaximumLength(10000).WithMessage("HTML body is too large.");
    }
}
