#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is not installed or not on PATH."
  echo "Install it from https://nodejs.org and try again."
  exit 1
fi

if [ ! -d "node_modules" ]; then
  echo "Installing dependencies - this only happens once..."
  npm install
fi

echo ""
echo "Starting D&D Helper..."
echo "Once it says \"Network:\", that URL is what other devices on your"
echo "Wi-Fi / LAN can use to open the same app on their own browser."
echo "Press Ctrl+C in this terminal to stop the server."
echo ""

npm run start
