#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
PID_DIR="$BACKEND_DIR/.dev-pids"

mkdir -p "$PID_DIR"

echo "[dev-up] Repo root: $ROOT_DIR"

echo "[dev-up] Starting infra via docker compose..."
(cd "$ROOT_DIR" && docker compose up -d)

start_service() {
  local name="$1"
  local module_dir="$2"
  local log_file="$3"

  if [[ -f "$PID_DIR/$name.pid" ]]; then
    local old_pid
    old_pid="$(cat "$PID_DIR/$name.pid" || true)"
    if [[ -n "${old_pid:-}" ]] && kill -0 "$old_pid" 2>/dev/null; then
      echo "[dev-up] $name already running (pid=$old_pid)"
      return 0
    fi
  fi

  echo "[dev-up] Starting $name..."
  (
    cd "$module_dir"
    nohup "$BACKEND_DIR/mvnw" -q spring-boot:run > "$log_file" 2>&1 &
    echo $! > "$PID_DIR/$name.pid"
  )
}

start_service "gateway" "$BACKEND_DIR/gateway-service" "$BACKEND_DIR/gateway.log"
start_service "restaurant" "$BACKEND_DIR/restaurant-service" "$BACKEND_DIR/restaurant.log"
start_service "order" "$BACKEND_DIR/order-service" "$BACKEND_DIR/order.log"
start_service "notification" "$BACKEND_DIR/notification-service" "$BACKEND_DIR/notification.log"

echo
echo "[dev-up] Done."
echo "[dev-up] Logs:"
echo "  - $BACKEND_DIR/gateway.log"
echo "  - $BACKEND_DIR/restaurant.log"
echo "  - $BACKEND_DIR/order.log"
echo "  - $BACKEND_DIR/notification.log"
echo
echo "[dev-up] Health checks (give it a few seconds to boot):"
echo "  curl -sS http://localhost:8080/actuator/health"
echo "  curl -sS http://localhost:8081/actuator/health"
echo "  curl -sS http://localhost:8082/actuator/health"
echo "  curl -sS http://localhost:8083/actuator/health"

