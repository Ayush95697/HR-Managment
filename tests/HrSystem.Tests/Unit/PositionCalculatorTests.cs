using HrSystem.Application.Common;

using Xunit;

namespace HrSystem.Tests.Unit;

public class PositionCalculatorTests
{
    [Fact]
    public void CalculateNewEndPosition_WithNoLastPosition_ShouldReturnInitialStep()
    {
        double position = PositionCalculator.CalculateNewEndPosition(null);
        Assert.Equal(1024.0, position);
    }

    [Fact]
    public void CalculateNewEndPosition_WithLastPosition_ShouldAddStep()
    {
        double position = PositionCalculator.CalculateNewEndPosition(1024.0);
        Assert.Equal(2048.0, position);
    }

    [Fact]
    public void CalculateBetweenPositions_BetweenTwoPositions_ShouldReturnMidpoint()
    {
        double position = PositionCalculator.CalculateBetweenPositions(1024.0, 2048.0);
        Assert.Equal(1536.0, position);
    }

    [Fact]
    public void CalculateBetweenPositions_BeforeFirstCard_ShouldReturnHalfOfFirst()
    {
        double position = PositionCalculator.CalculateBetweenPositions(null, 1024.0);
        Assert.Equal(512.0, position);
    }
}