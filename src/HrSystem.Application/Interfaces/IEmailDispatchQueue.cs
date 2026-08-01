using System;
using System.Collections.Generic;

namespace HrSystem.Application.Interfaces;

public interface IEmailDispatchQueue
{
    void EnqueueDispatch(Guid emailLogId, Dictionary<string, string>? placeholders);
}