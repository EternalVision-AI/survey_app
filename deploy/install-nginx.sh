#!/usr/bin/env bash
# Sets up nginx on the production Ubuntu server to serve the app at
# http://famkb.ch/unibas/survey/ (no port number needed) by:
#   - building the frontend with the correct base path
#   - serving that static build directly
#   - reverse-proxying /unibas/survey/{api,internal,data} to the backend,
#     which must already be running via systemd on 127.0.0.1:4000
#     (see backend/deploy/install-systemd.sh)
#
# Usage:
#   sudo bash deploy/install-nginx.sh [domain]
# Example:
#   sudo bash deploy/install-nginx.sh famkb.ch
set -euo pipefail

if [[ $EUID -ne 0 ]]; then
  echo "This script must be run as root (use sudo)." >&2
  exit 1
fi

DOMAIN="${1:-famkb.ch}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SITE_NAME="survey-app"
SITE_AVAILABLE="/etc/nginx/sites-available/${SITE_NAME}"
SITE_ENABLED="/etc/nginx/sites-enabled/${SITE_NAME}"

if ! command -v nginx >/dev/null 2>&1; then
  echo "Installing nginx..."
  apt-get update
  apt-get install -y nginx
fi

echo "Building frontend (VITE_BASE_PATH=/unibas/survey)..."
(cd "$APP_ROOT/frontend" && VITE_BASE_PATH=/unibas/survey npm run build)

if [[ ! -f "$APP_ROOT/frontend/dist/index.html" ]]; then
  echo "Frontend build did not produce dist/index.html — aborting." >&2
  exit 1
fi

echo "Writing $SITE_AVAILABLE (domain: $DOMAIN)"
sed \
  -e "s#__APP_ROOT__#${APP_ROOT}#g" \
  -e "s#__DOMAIN__#${DOMAIN}#g" \
  "$SCRIPT_DIR/nginx-survey-app.conf.template" > "$SITE_AVAILABLE"

ln -sf "$SITE_AVAILABLE" "$SITE_ENABLED"

echo "Testing nginx config..."
nginx -t

echo "Reloading nginx..."
systemctl reload nginx || systemctl restart nginx

echo
echo "Done. The app should now be reachable at:"
echo "  http://${DOMAIN}/unibas/survey/"
echo
echo "Make sure the backend is running via systemd first:"
echo "  sudo bash backend/deploy/install-systemd.sh"
echo "  systemctl status survey-backend"
echo
echo "For HTTPS (recommended before going live for real), run:"
echo "  sudo apt-get install -y certbot python3-certbot-nginx"
echo "  sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
