namespace HrSystem.Application.Common;

public static class PositionCalculator
{
    public const double DefaultInitialPosition = 1024.0;
    public const double DefaultStep = 1024.0;

    public static double CalculateNewEndPosition(double? lastPosition)
    {
        return (lastPosition ?? 0.0) + DefaultStep;
    }

    public static double CalculateBetweenPositions(double? previousPosition, double? nextPosition)
    {
        if (!previousPosition.HasValue && !nextPosition.HasValue)
        {
            return DefaultInitialPosition;
        }

        if (!previousPosition.HasValue && nextPosition.HasValue)
        {
            return nextPosition.Value / 2.0;
        }

        if (previousPosition.HasValue && !nextPosition.HasValue)
        {
            return previousPosition.Value + DefaultStep;
        }

        return (previousPosition!.Value + nextPosition!.Value) / 2.0;
    }
}
