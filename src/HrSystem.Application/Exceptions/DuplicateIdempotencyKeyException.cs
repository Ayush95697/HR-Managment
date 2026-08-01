using System;

using HrSystem.Application.Exceptions;

namespace HrSystem.Application.Exceptions;

public class DuplicateIdempotencyKeyException : AppConflictException
{
    public DuplicateIdempotencyKeyException(string message) : base(message)
    {
    }
}