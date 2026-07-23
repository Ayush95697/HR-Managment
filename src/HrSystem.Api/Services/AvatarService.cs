using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;

namespace HrSystem.Api.Services;

public class AvatarService : IAvatarService
{
    private const int MaxDimension = 256;
    private readonly string _avatarsDirectory;
    private readonly string _baseUrl;

    private static readonly string[] AllowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];

    public AvatarService(IWebHostEnvironment env)
    {
        _avatarsDirectory = Path.Combine(env.WebRootPath, "avatars");
        _baseUrl = "/avatars";
        Directory.CreateDirectory(_avatarsDirectory);
    }

    public async Task<string> SaveAvatarAsync(Guid userId, IFormFile file)
    {
        // Validate via magic bytes — decode as actual image, not just extension/MIME
        using var stream = file.OpenReadStream();
        Image image;
        try
        {
            image = await Image.LoadAsync(stream);
        }
        catch
        {
            throw new ArgumentException("File could not be decoded as a valid image.");
        }

        // Delete any existing avatar files for this user
        await DeleteAvatarAsync(userId);

        // Determine output extension from content-type
        var ext = file.ContentType.ToLower() switch
        {
            "image/jpeg" => ".jpg",
            "image/png"  => ".png",
            "image/webp" => ".webp",
            _            => ".jpg"
        };

        var fileName = $"{userId}{ext}";
        var filePath = Path.Combine(_avatarsDirectory, fileName);

        // Resize to max 256×256 maintaining aspect ratio
        image.Mutate(x => x.Resize(new ResizeOptions
        {
            Size = new Size(MaxDimension, MaxDimension),
            Mode = ResizeMode.Max
        }));

        await image.SaveAsync(filePath);
        image.Dispose();

        return $"{_baseUrl}/{fileName}?t={DateTimeOffset.UtcNow.ToUnixTimeSeconds()}";
    }

    public Task DeleteAvatarAsync(Guid userId)
    {
        foreach (var ext in AllowedExtensions)
        {
            var path = Path.Combine(_avatarsDirectory, $"{userId}{ext}");
            if (File.Exists(path))
                File.Delete(path);
        }
        return Task.CompletedTask;
    }
}
