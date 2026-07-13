#!/usr/bin/env bash
# Installs the KESB survey backend as a systemd service so it auto-starts
# on boot and restarts on crash. Run on the production Ubuntu server, e.g.:
#   sudo bash backend/deploy/install-systemd.sh
set -euo pipefail

if [[ $EUID -ne 0 ]]; then
  echo "This script must be run as root (use sudo)." >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SERVICE_NAME="survey-backend"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
SERVICE_USER="${SUDO_USER:-$(logname 2>/dev/null || echo root)}"

NODE_BIN="$(command -v node || true)"
if [[ -z "$NODE_BIN" ]]; then
  echo "node not found on PATH. Install Node.js first (or run this script as the user whose PATH includes node, via sudo -E)." >&2
  exit 1
fi

if [[ ! -f "$APP_DIR/.env" ]]; then
  echo "Warning: $APP_DIR/.env not found. The service will start but API calls needing" >&2
  echo "MISTRAL_API_KEY / EDENAI_API_KEY / SMTP_* will fail until it's created." >&2
fi

echo "Building backend (npm run build)..."
(cd "$APP_DIR" && npm run build)

if [[ ! -f "$APP_DIR/dist/src/index.js" ]]; then
  echo "Build did not produce dist/src/index.js — aborting." >&2
  exit 1
fi

echo "Writing $SERVICE_FILE"
sed \
  -e "s#__SERVICE_USER__#${SERVICE_USER}#g" \
  -e "s#__APP_DIR__#${APP_DIR}#g" \
  -e "s#__NODE_BIN__#${NODE_BIN}#g" \
  "$SCRIPT_DIR/survey-backend.service.template" > "$SERVICE_FILE"

echo "Reloading systemd and enabling ${SERVICE_NAME}..."
systemctl daemon-reload
systemctl enable "$SERVICE_NAME"
systemctl restart "$SERVICE_NAME"

sleep 1
systemctl --no-pager status "$SERVICE_NAME" || true

echo
echo "Done. Useful commands:"
echo "  systemctl status ${SERVICE_NAME}"
echo "  journalctl -u ${SERVICE_NAME} -f"
echo "  systemctl restart ${SERVICE_NAME}"
