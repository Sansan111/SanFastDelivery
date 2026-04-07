#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
PID_DIR="$BACKEND_DIR/.dev-pids"

stop_pid_file() {
  local name="$1"
  local pid_file="$PID_DIR/$name.pid"

  if [[ ! -f "$pid_file" ]]; then
    echo "[dev-down] $name: no pid file"
    return 0
  fi

  local pid
  pid="$(cat "$pid_file" || true)"
  if [[ -z "${pid:-}" ]]; then
    echo "[dev-down] $name: empty pid file"
    rm -f "$pid_file"
    return 0
  fi

  if kill -0 "$pid" 2>/dev/null; then
    echo "[dev-down] Stopping $name (pid=$pid)..."
    kill "$pid" 2>/dev/null || true
    sleep 1
    if kill -0 "$pid" 2>/dev/null; then
      echo "[dev-down] $name still running, force kill (pid=$pid)..."
      kill -9 "$pid" 2>/dev/null || true
    fi
  else
    echo "[dev-down] $name already stopped (pid=$pid)"
  fi

  rm -f "$pid_file"
}

echo "[dev-down] Stopping local services..."
stop_pid_file "gateway"
stop_pid_file "restaurant"
stop_pid_file "order"
stop_pid_file "notification"

echo "[dev-down] Done."
echo "[dev-down] If you also want to stop infra:"
echo "  cd \"$ROOT_DIR\" && docker compose down"

