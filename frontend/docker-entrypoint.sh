#!/bin/sh
set -eu

# The source tree is bind-mounted into the Metro container while node_modules is
# kept in a named volume. Refresh that volume whenever the lockfile or manifest
# changes, so Metro never starts against stale dependencies.
dependency_hash=$(sha256sum package.json package-lock.json | sha256sum | cut -d ' ' -f 1)
marker=node_modules/.ezra-dependency-hash
installed_hash=$(cat "$marker" 2>/dev/null || true)

if [ "$dependency_hash" != "$installed_hash" ]; then
  echo "Frontend dependencies changed; syncing the Metro volume with npm ci..."
  npm ci
  printf '%s\n' "$dependency_hash" > "$marker"
fi

exec "$@"
