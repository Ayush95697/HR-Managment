using System;
using System.Threading.Tasks;
using HrSystem.Infrastructure.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HrSystem.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SeedController : ControllerBase
{
    private readonly ITestDataSeeder _testDataSeeder;

    public SeedController(ITestDataSeeder testDataSeeder)
    {
        _testDataSeeder = testDataSeeder;
    }

    [HttpPost("generate")]
    [HttpPost]
    public async Task<IActionResult> GenerateTestData()
    {
        try
        {
            await _testDataSeeder.SeedAsync();
            return Ok(new { message = "Successfully seeded test data into the database." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message, stackTrace = ex.StackTrace });
        }
    }
}
