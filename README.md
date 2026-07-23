# HR Management System

A comprehensive HR Management and Task Tracking System built with a Clean Architecture backend (.NET 8) and a modern, interactive frontend (React + TypeScript).

## Overview

The HR Management System is designed to handle user authentication, role-based access control (RBAC), department management, and task boards. It features a drag-and-drop Kanban board for task tracking, optimistic concurrency control to prevent data overwriting, and comprehensive auditing.

## Tech Stack

### Backend
- **Framework**: .NET 8 Web API
- **Architecture**: Clean Architecture (Api, Application, Domain, Infrastructure)
- **Database**: SQL Server (Entity Framework Core)
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: FluentValidation
- **Documentation**: Swagger / OpenAPI

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **State Management**: Zustand & React Query (@tanstack/react-query)
- **Routing**: React Router DOM
- **Forms & Validation**: React Hook Form + Zod
- **Drag & Drop**: @dnd-kit (Kanban Board)
- **Icons**: Lucide React
- **API Client**: Axios

## Features

- **Authentication & Authorization**: Secure login with JWT. Role-based access control and department-level restrictions.
- **Department & User Management**: Manage departments and employees seamlessly.
- **Kanban Task Boards**: Interactive drag-and-drop boards to manage tasks (Cards) with different statuses.
- **Optimistic Concurrency**: Task cards support optimistic concurrency to prevent lost updates when multiple users edit the same card.
- **Audit Logging**: Comprehensive auditing of actions within the system.

## Project Structure

```text
HR-Managment/
├── src/
│   ├── HrSystem.Api/             # Web API, Controllers, Middleware, Configuration
│   ├── HrSystem.Application/     # Business Logic, Services, DTOs, Interfaces, Validators
│   ├── HrSystem.Domain/          # Core Domain Models, Entities, Exceptions
│   └── HrSystem.Infrastructure/  # EF Core DbContext, Migrations, External Services
├── tests/
│   └── HrSystem.Tests/           # Unit and Integration Tests (InMemory DB)
├── client/                       # React Frontend Application
└── HrSystem.sln                  # .NET Solution File
```

## Getting Started

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js](https://nodejs.org/) (v18+ recommended)
- SQL Server (or LocalDB)

### Backend Setup

1. Navigate to the root directory and build the solution:
   ```bash
   dotnet build
   ```
2. Navigate to the API directory:
   ```bash
   cd src/HrSystem.Api
   ```
3. Run `dotnet user-secrets set "ConnectionStrings:DefaultConnection" "..."` and `dotnet user-secrets set "JwtSettings:Secret" "..."` before running the API — these are intentionally left blank in appsettings.json. Note: The JWT secret must be at least 32 characters long.
4. Run the API:
   ```bash
   dotnet run
   ```
   The API will start, and the database will be automatically seeded on startup if it can connect. Swagger documentation is available in the Development environment at `/swagger`.

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`.

## Testing

The solution includes a test project `HrSystem.Tests` which covers integration and unit tests using an InMemory database.
To run the tests:
```bash
dotnet test
```
