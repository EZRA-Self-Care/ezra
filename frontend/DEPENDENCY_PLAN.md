# Frontend dependency documentation plan

1. **Set the supported baseline.** State the Expo SDK and minimum Node.js version, and point to the matching Expo versioned reference.
2. **Document reproducible setup.** Use `npm ci` for installs from the committed lockfile and explain which files to commit after dependency changes.
3. **Document safe dependency changes.** Route Expo and React Native additions and compatibility fixes through Expo's SDK-aware installer.
4. **Add checks and recovery steps.** Explain how to detect mismatches, repair the lockfile, and handle common install errors.
