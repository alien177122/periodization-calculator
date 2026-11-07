#!/usr/bin/env bash
# Mac/Linux: archive old project dir, apply source.tar.gz, preserve tunnel + DB.
# Usage:
#   scripts/apply-update-preserve-tunnel.sh ./releases/React_Project_*/source.tar.gz [TARGET_DIR]
set -euo pipefail

ARCHIVE="${1:?Usage: $0 <source.tar.gz> [target_dir]}"
TARGET="${2:-$(cd "$(dirname "$0")/.." && pwd)}"
STAMP="$(date +%Y-%m-%d_%H%M)"
ARCHIVE_ROOT="$(dirname "$TARGET")/_React_Project_Archive"
PRESERVE_TMP="$(mktemp -d)"

cleanup() { rm -rf "$PRESERVE_TMP"; }
trap cleanup EXIT

preserve_names=(
  .env .env.local .env.public .env.public.local
  .env.docker .env.docker.local .env.production
  gym.db gym.db-wal gym.db-shm
)

echo "== React Project update (preserve tunnel) =="
echo "Target: $TARGET"
echo "Archive: $ARCHIVE"

# Stop dev/public node (launchd public agent keeps running unless user stops it)
pkill -f "server/index.js" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

if [[ -d "$TARGET" ]]; then
  for name in "${preserve_names[@]}"; do
    [[ -e "$TARGET/$name" ]] && cp -a "$TARGET/$name" "$PRESERVE_TMP/" && echo "Preserved: $name"
  done
  for dir in docker-data workspace-files; do
    [[ -d "$TARGET/$dir" ]] && cp -a "$TARGET/$dir" "$PRESERVE_TMP/" && echo "Preserved: $dir/"
  done

  mkdir -p "$ARCHIVE_ROOT"
  mv "$TARGET" "$ARCHIVE_ROOT/React_Project_${STAMP}"
  echo "Archived -> $ARCHIVE_ROOT/React_Project_${STAMP}"
fi

PARENT="$(dirname "$TARGET")"
mkdir -p "$PARENT"
tar -xzf "$ARCHIVE" -C "$PARENT"

EXTRACTED="$(find "$PARENT" -maxdepth 1 -type d -name 'React_Project*' | sort | tail -1)"
[[ -n "$EXTRACTED" ]] || { echo "Extracted folder not found"; exit 1; }

if [[ "$EXTRACTED" != "$TARGET" ]]; then
  mv "$EXTRACTED" "$TARGET"
fi

for name in "${preserve_names[@]}"; do
  [[ -e "$PRESERVE_TMP/$name" ]] && cp -a "$PRESERVE_TMP/$name" "$TARGET/" && echo "Restored: $name"
done
for dir in docker-data workspace-files; do
  [[ -d "$PRESERVE_TMP/$dir" ]] && cp -a "$PRESERVE_TMP/$dir" "$TARGET/" && echo "Restored: $dir/"
done

cd "$TARGET"
npm install
npm run build

echo ""
echo "Done. .env.public (tunnel token) + gym.db preserved."
echo "Restart: npm run public:stable   # or launchd agent if installed"
