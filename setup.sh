#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cd "$SCRIPT_DIR"

echo "[1/5] Checking Docker..."
if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is not installed or not in PATH."
  echo "Please install Docker Desktop or Docker Engine, then run ./setup.sh again."
  exit 1
fi

if docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE_CMD="docker-compose"
else
  echo "Docker Compose was not found."
  echo "Please install Docker Compose, then run ./setup.sh again."
  exit 1
fi

if [ ! -f .env ] && [ -f .env.example ]; then
  cp .env.example .env
  echo "Created .env from .env.example"
fi

set -a
. ./.env.example
if [ -f .env ]; then
  . ./.env
fi
set +a

echo "[2/5] Stopping old containers if any..."
sh -c "$COMPOSE_CMD down --remove-orphans"

echo "[3/5] Rebuilding images..."
sh -c "$COMPOSE_CMD build"

echo "[4/5] Starting the full project..."
sh -c "$COMPOSE_CMD up -d"

echo "[5/5] Done."
echo
echo "=========================================================="
echo "                  AI SHOE SHOP APP STATUS"
echo "=========================================================="
echo
echo "[1] LOCAL RUN (DOCKER CONTAINER):"
echo "  - Frontend:    http://localhost:${FRONTEND_PORT}"
echo "  - Backend/API: http://localhost:${BACKEND_PORT}"
echo "  - Local DB:    postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:${DB_PORT_FORWARD}/${POSTGRES_DB}"
echo
echo "[2] CLOUD DEPLOYMENT (RENDER):"
echo "  - API/Backend Render: https://ai-shop-app-backend.onrender.com/api"
echo "  - Web App Render (If any): https://ai-shop-app-backend.onrender.com"
echo
echo "Test accounts:"
echo "  - Admin: email: admin@gmail.com / password: 123456"
echo "  - User:  email: user@gmail.com  / password: 123456"
echo "=========================================================="
echo
sh -c "$COMPOSE_CMD ps"
