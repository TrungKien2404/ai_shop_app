@echo off
setlocal EnableExtensions EnableDelayedExpansion

cd /d "%~dp0"

echo [1/5] Kiem tra Docker...
docker --version >nul 2>&1
if errorlevel 1 (
  echo Docker chua duoc cai hoac chua co trong PATH.
  echo Hay cai Docker Desktop roi chay lai setup.bat
  exit /b 1
)

set "COMPOSE_CMD="
docker compose version >nul 2>&1
if not errorlevel 1 set "COMPOSE_CMD=docker compose"
if not defined COMPOSE_CMD (
  docker-compose version >nul 2>&1
  if not errorlevel 1 set "COMPOSE_CMD=docker-compose"
)

if not defined COMPOSE_CMD (
  echo Khong tim thay Docker Compose.
  echo Hay cai Docker Desktop hoac docker-compose roi chay lai.
  exit /b 1
)

if not exist ".env" (
  if exist ".env.example" (
    copy /Y ".env.example" ".env" >nul
    echo Da tao file .env tu .env.example
  )
)

for /f "usebackq tokens=1,* delims==" %%A in (`findstr /r "^[A-Z_][A-Z_]*=" .env.example`) do (
  set "%%A=%%B"
)

if exist ".env" (
  for /f "usebackq tokens=1,* delims==" %%A in (`findstr /r "^[A-Z_][A-Z_]*=" .env`) do (
    set "%%A=%%B"
  )
)

echo [2/5] Dung container cu neu co...
call %COMPOSE_CMD% down --remove-orphans

echo [3/5] Build lai image...
call %COMPOSE_CMD% build
if errorlevel 1 (
  echo Build Docker that bai.
  exit /b 1
)

echo [4/5] Chay toan bo project...
call %COMPOSE_CMD% up -d
if errorlevel 1 (
  echo Khoi dong Docker Compose that bai.
  exit /b 1
)

echo [5/5] Hoan tat.
echo.
echo ==========================================================
echo                   AI SHOE SHOP APP STATUS
echo ==========================================================
echo.
echo [1] CHAY LOCAL (DOCKER CONTAINER):
echo   - Frontend:    http://localhost:%FRONTEND_PORT%
echo   - Backend/API: http://localhost:%BACKEND_PORT%
echo   - Local DB:    postgresql://%POSTGRES_USER%:%POSTGRES_PASSWORD%@localhost:%DB_PORT_FORWARD%/%POSTGRES_DB%
echo.
echo [2] DA DEPLOY TREN (RENDER):
echo   - API/Backend Render: https://ai-shop-app-backend.onrender.com/api
echo   - Web App Render: https://ai-shop-app-backend.onrender.com
echo   - Web App Render: https://ai-shop-app.onrender.com
echo.
echo Tai khoan test:
echo   - Admin: email: admin@gmail.com / password: 123456
echo   - User:  email: user@gmail.com  / password: 123456
echo ==========================================================
echo.
call %COMPOSE_CMD% ps
