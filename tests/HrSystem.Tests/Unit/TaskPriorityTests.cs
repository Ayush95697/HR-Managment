using System;
using Xunit;
using HrSystem.Domain.Enums;
using HrSystem.Application.DTOs;
using HrSystem.Domain.Entities;

namespace HrSystem.Tests.Unit
{
    public class TaskPriorityTests
    {
        [Fact]
        public void TaskPriority_Critical_ShouldHaveNumericValueOf3()
        {
            // Arrange & Act
            var criticalValue = (int)TaskPriority.Critical;

            // Assert
            Assert.Equal(3, criticalValue);
        }

        [Fact]
        public void TaskPriority_Critical_ShouldPreserveValueThroughDto()
        {
            // Arrange
            var request = new CreateTaskCardRequest(
                Guid.NewGuid(),
                "Test Card",
                null,
                TaskPriority.Critical,
                null,
                null
            );

            // Assert
            Assert.Equal(TaskPriority.Critical, request.Priority);
            Assert.Equal(3, (int)request.Priority);
        }
    }
}
