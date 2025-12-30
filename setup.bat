@echo off
REM SprueCrafter Setup Script for Windows
REM Installs all dependencies and prepares the application

echo ===================================
echo SprueCrafter Setup
echo ===================================
echo.

REM Check for Python
echo Checking for Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed
    echo Please install Python 3.8 or higher
    pause
    exit /b 1
)

for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
echo Found Python %PYTHON_VERSION%
echo.

REM Check for Node.js
echo Checking for Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed
    echo Please install Node.js 16 or higher
    pause
    exit /b 1
)

for /f %%i in ('node --version') do set NODE_VERSION=%%i
echo Found Node.js %NODE_VERSION%
echo.

REM Install Python dependencies
echo Installing Python dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo Error: Failed to install Python dependencies
    pause
    exit /b 1
)
echo Python dependencies installed successfully
echo.

REM Install Node.js dependencies
echo Installing Node.js dependencies...
call npm install
if errorlevel 1 (
    echo Error: Failed to install Node.js dependencies
    pause
    exit /b 1
)
echo Node.js dependencies installed successfully
echo.

echo ===================================
echo Setup completed successfully!
echo ===================================
echo.
echo To start SprueCrafter:
echo   npm start
echo.
echo For development mode:
echo   npm run dev
echo.
pause
