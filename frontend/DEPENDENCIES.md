# Frontend dependency workflow

Use the four steps in [DEPENDENCY_PLAN.md](DEPENDENCY_PLAN.md) to manage frontend packages. This project uses Expo SDK 57 and Node.js 22.13 or newer. The Docker image uses Node.js 22.

## 1. Supported baseline

The `expo` entry in `package.json` sets the Expo SDK version. Use Expo modules, React Native, and Expo tools that support this SDK. Check the [Expo SDK 57 reference](https://docs.expo.dev/versions/v57.0.0/) for SDK details.

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

Run `npm ci` to check that the lockfile installs the dependencies.

If npm reports `ERESOLVE`:

1. Check that Node.js is version 22.13 or newer.
2. Use Expo's installer for Expo and React Native packages.
3. Use npm for frontend packages. Do not mix lockfiles from other package managers.
4. Do not use `--force` or `--legacy-peer-deps` to hide a version mismatch.

The Docker Metro profile stores dependencies in a named volume. If `package.json` or `package-lock.json` changes, update that volume:

```sh
docker compose --profile dev run --rm --no-deps metro npm ci
```

This command keeps the database volume. Then start Metro:

```sh
docker compose --profile dev up --build metro
```
