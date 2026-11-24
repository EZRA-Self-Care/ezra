# Frontend dependency workflow

Follow the four steps in [DEPENDENCY_PLAN.md](DEPENDENCY_PLAN.md) to manage frontend dependencies. The frontend uses Expo SDK 58 and Node.js 22.13 or newer. The frontend Docker image uses the same Node.js version.

## 1. Supported baseline

The `expo` entry in `package.json` sets the Expo SDK version. Use Expo modules, React Native, and Expo tools that support this SDK. Check the [Expo SDK 58 reference](https://docs.expo.dev/versions/v58.0.0/) for SDK-specific details.

## 2. Reproducible setup

From `frontend/`, install exactly what the committed lockfile specifies:

```sh
npm ci
```

`npm ci` removes the current `node_modules` folder. It stops if `package.json` and `package-lock.json` do not match. Do not edit the lockfile by hand. When dependency metadata changes, run `npm install`. Commit both `package.json` and `package-lock.json`.

## 3. Add or update packages

Use Expo's installer to add Expo modules and React Native libraries. It selects versions that support the installed SDK:

```sh
npx expo install <package>
```

Do not use `npm install <package>` for these packages. It can select a release for another Expo SDK. For development tools that do not depend on Expo or React Native, use `npm install --save-dev <package>`.

## 4. Check and recover

After you change a dependency, check SDK compatibility and review the direct dependencies:

```sh
npx expo install --check
npm ls --depth=0
```

If Expo reports incompatible packages, install its recommended versions. Then refresh the lockfile:

```sh
npx expo install --fix
npm install
```

Run `npm ci` to confirm that the lockfile can install the dependencies. If npm reports `ERESOLVE`, check that Node.js is version 22.13 or newer. Use Expo's installer for Expo or React Native packages. Remove lockfiles from other package managers. Do not use `--force` or `--legacy-peer-deps` to hide a version mismatch.

The Docker Metro profile stores dependencies in a named volume. At startup, the container checks `package.json` and `package-lock.json`. It runs `npm ci` if either file changed. Run `docker compose --profile dev up --build --force-recreate metro` to rebuild and recreate Metro. This keeps the database volume.
