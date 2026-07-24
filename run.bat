@echo off
echo ==============================================
echo    Starting HR Management System
echo ==============================================
echo.

echo [1/2] Starting Backend API (.NET 8)...
cd src\HrSystem.Api
start "HR System API" cmd /c "title HR System API (Backend) && dotnet run && pause"
cd ..\..

echo [2/2] Starting Frontend App (React)...
cd client
if not exist "node_modules\" (
    echo node_modules not found. Running npm install...
    npm install
)
start "HR System Client" cmd /c "title HR System Client (Frontend) && npm run dev && pause"
cd ..

echo.
echo Both backend and frontend are starting in separate windows.
echo - Backend API will be on http://localhost:5xxx
echo - Frontend App will be on http://localhost:5173
echo.
pause
