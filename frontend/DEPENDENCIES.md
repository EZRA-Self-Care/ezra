# Frontend dependency workflow

This guide implements the four-step documentation plan in [DEPENDENCY_PLAN.md](DEPENDENCY_PLAN.md). The frontend uses Expo SDK 58. Use Node.js 22.13 or newer; the same baseline is used by the frontend Docker image.

## 1. Supported baseline

The Expo SDK version is set by `expo` in `package.json`. Expo's native modules, React Native, and Expo tooling must be compatible with that SDK. For this project, consult the [Expo SDK 58 reference](https://docs.expo.dev/versions/v58.0.0/) when checking SDK-specific behavior.

## 2. Reproducible setup

From `frontend/`, install exactly what the committed lockfile specifies:

```sh
npm ci
```

`npm ci` removes any existing `node_modules` and fails if `package.json` and `package-lock.json` disagree. Do not edit the lockfile by hand. When dependency metadata changes, regenerate it with `npm install` and commit `package.json` and `package-lock.json` together.

## 3. Add or update packages

Use Expo's installer for Expo modules and React Native libraries so it selects versions compatible with the installed SDK:

```sh
npx expo install <package>
```

Avoid `npm install <package>` for these packages because it selects the newest semver-compatible release, which may target another Expo SDK. For ordinary development tools that do not depend on Expo or React Native, use `npm install --save-dev <package>`.

## 4. Check and recover

After a dependency change, run the SDK compatibility check and review the direct dependency tree:

```sh
npx expo install --check
npm ls --depth=0
```

If Expo reports incompatible packages, apply its recommended SDK versions and refresh the lockfile:

```sh
npx expo install --fix
npm install
```

Then run `npm ci` to confirm the lockfile can reproduce the install. If npm reports `ERESOLVE`, first make sure Node.js is 22.13 or newer, use Expo's installer for Expo or React Native packages, and avoid mixing lockfiles from another package manager. Do not use `--force` or `--legacy-peer-deps` to hide a mismatch.

For Docker's Metro profile, dependencies are stored in a named volume. The container checks `package.json` and `package-lock.json` at startup and runs `npm ci` when either file changes. Rebuild and recreate Metro with `docker compose --profile dev up --build --force-recreate metro`; this preserves the database volume.
