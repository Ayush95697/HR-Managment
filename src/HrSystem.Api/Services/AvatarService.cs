using System;
using System.IO;
using System.Threading.Tasks;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;

namespace HrSystem.Api.Services;

public class AvatarService : IAvatarService
{
    private const int MaxDimension = 256;
    private readonly BlobServiceClient _blobServiceClient;
    private readonly string _containerName;

    private static readonly string[] AllowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];

    public AvatarService(BlobServiceClient blobServiceClient, IConfiguration configuration)
    {
        _blobServiceClient = blobServiceClient;
        _containerName = configuration.GetValue<string>("AzureStorage:AvatarContainerName") ?? "avatars";
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

        // Resize to max 256×256 maintaining aspect ratio
        image.Mutate(x => x.Resize(new ResizeOptions
        {
            Size = new Size(MaxDimension, MaxDimension),
            Mode = ResizeMode.Max
        }));

        // Get container client and ensure it exists and is public
        var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
        await containerClient.CreateIfNotExistsAsync(PublicAccessType.Blob);

        var blobClient = containerClient.GetBlobClient(fileName);

        using var memoryStream = new MemoryStream();
        
        // Save to memory stream with appropriate encoder
        if (ext == ".png")
            await image.SaveAsPngAsync(memoryStream);
        else if (ext == ".webp")
            await image.SaveAsWebpAsync(memoryStream);
        else
            await image.SaveAsJpegAsync(memoryStream);

        memoryStream.Position = 0;

        var blobHttpHeaders = new BlobHttpHeaders { ContentType = file.ContentType };
        await blobClient.UploadAsync(memoryStream, new BlobUploadOptions { HttpHeaders = blobHttpHeaders });
        
        image.Dispose();

        return $"{blobClient.Uri}?t={DateTimeOffset.UtcNow.ToUnixTimeSeconds()}";
    }

    public async Task DeleteAvatarAsync(Guid userId)
    {
        var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
        
        foreach (var ext in AllowedExtensions)
        {
            var fileName = $"{userId}{ext}";
            var blobClient = containerClient.GetBlobClient(fileName);
            await blobClient.DeleteIfExistsAsync();
        }
    }
}
