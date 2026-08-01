using System;
using System.Diagnostics;

namespace HrSystem.Infrastructure.Email;

[DebuggerNonUserCode]
public class EmailSendException : Exception
{
    public EmailSendException(string message) : base(message) { }
    public EmailSendException(string message, Exception inner) : base(message, inner) { }
}