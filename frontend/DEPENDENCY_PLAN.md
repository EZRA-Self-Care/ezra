# Frontend dependency documentation plan

1. **Set the supported baseline.** Name the Expo SDK and minimum Node.js version. Link to the matching Expo reference.
2. **Set up repeatable installs.** Use `npm ci` with the committed lockfile. After a dependency change, commit `package.json` and `package-lock.json`.
3. **Change dependencies safely.** Use Expo's SDK-aware installer to add Expo and React Native packages and to fix version mismatches.
4. **Check and repair installs.** Run compatibility checks. Explain how to update the lockfile and resolve common install errors.
