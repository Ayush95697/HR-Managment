using System;
using System.Diagnostics;

namespace HrSystem.Application.Exceptions;

[DebuggerNonUserCode]
public class AppUnauthorizedException : Exception
{
    public AppUnauthorizedException(string message) : base(message) { }
}

[DebuggerNonUserCode]
public class AppNotFoundException : Exception
{
    public AppNotFoundException(string message) : base(message) { }
}

[DebuggerNonUserCode]
public class AppBadRequestException : Exception
{
    public AppBadRequestException(string message) : base(message) { }
}

[DebuggerNonUserCode]
public class AppConflictException : Exception
{
    public AppConflictException(string message) : base(message) { }
}
