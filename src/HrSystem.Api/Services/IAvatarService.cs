using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace HrSystem.Api.Services;

public interface IAvatarService
{
    /// <summary>
    /// Validates, resizes, and saves an avatar image for the given user.
    /// Returns the relative URL path to serve the image.
    /// </summary>
    Task<string> SaveAvatarAsync(Guid userId, IFormFile file);

    /// <summary>
    /// Deletes the avatar file for the given user from disk, if it exists.
    /// </summary>
    Task DeleteAvatarAsync(Guid userId);
}
