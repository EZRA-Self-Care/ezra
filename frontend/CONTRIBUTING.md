# Contributing to the EZRA frontend

Use this guide to make a frontend change. Follow [README.md](README.md) to set up the app. This guide describes the change workflow and screen patterns.

## 1. Start the app

1. Clone and install:
   ```bash
   git clone https://github.com/EZRA-Self-Care/ezra.git
   cd ezra/frontend && npm ci
   ```
2. Start the backend. See [`../backend/README.md`](../backend/README.md) or [`../DOCKER.md`](../DOCKER.md). On macOS, AirPlay can use port 5000. If it does, set `PORT=5001`.
3. Create `frontend/.env`. Set your computer's LAN IP. A phone cannot use your computer's `localhost` address:
   ```
   EXPO_PUBLIC_API_URL=http://192.168.x.x:5001
   ```
4. Sign in to Expo on your computer with `npx expo login`. Sign in to Expo Go on your phone with the same account.
5. Run `npm start`. Scan the QR code with your phone's camera. Connect the phone and computer to the same Wi-Fi network.

The development server runs on your computer. Your phone needs Expo Go.

## 2. Make a change

```bash
git switch main && git pull
git switch -c your-name/short-description   # Example: logan/delete-confirmation
# Edit the files.
npm run typecheck && npm run lint            # both must pass
git add <the files you changed>              # not `git add -A`
git commit -m "Add confirmation before deleting a task"
git push -u origin your-name/short-description
```

Open a pull request to `main` on GitHub. Ask a teammate to review it. Keep each pull request focused on one task.

## 3. Patterns to follow

**API requests.** Send all requests through [`src/api/client.ts`](src/api/client.ts). Use the backend field names (`snake_case`). Types are in [`src/types/models.ts`](src/types/models.ts). If a backend field changes, update both files in the same pull request.

**Load screen data.** Use `useApi` with a loader wrapped in `useCallback`. The hook reloads data when the screen gains focus. This shows edits made on other screens:

```tsx
const load = useCallback(() => api.tasks.list(), []);
const { data, error, loading, reload } = useApi<Task[]>(load);
```

Render the loading and error states. Render an empty state when the screen has no data. See [`src/components/StateView.tsx`](src/components/StateView.tsx): `<Loading />`, `<ErrorState message={error} onRetry={reload} />`, and `<EmptyState />`.

**Save data.** Run write requests with `useMutation().run(...)`. Set the button's `disabled` prop to `mutation.busy`. This prevents duplicate requests. Show `mutation.error` with `<ErrorState />`.

**Edit forms.** Load the data before you mount the form. Pass the loaded values as its initial values. See `TaskForm` in [`src/app/tasks/[id].tsx`](src/app/tasks/[id].tsx). Do not copy loaded data into state inside `useEffect`. The lint rules reject this pattern.

**Dates.** The backend expects the user's local date. Use `localDate()` and `formatDue()` from [`src/lib/dates.ts`](src/lib/dates.ts). Do not use `new Date().toISOString()` for a local date. It returns a UTC date, which can be different near midnight.

**Return after save.** Use `goBack('/lists')` from [`src/lib/navigation.ts`](src/lib/navigation.ts). The function opens a tab if a link opened the screen directly.

**Styles.** Use the colors, spacing, and text styles in [`src/constants/theme.ts`](src/constants/theme.ts). Use shared components such as `Screen`, `Card`, `Button`, `Field`, `Chips`, and `CheckRow`. Do not hard-code hex colors.

**App wording.** Use supportive language. Use “Carried over” for a task from an earlier date. Skipping a goal has no penalty.

## 4. Adding a package

Use `npx expo install <package>` for Expo and React Native packages so the version matches our Expo SDK. See [DEPENDENCIES.md](DEPENDENCIES.md) for the full dependency workflow.

## Common problems

| Problem | Fix |
| --- | --- |
| Expo Go: "You need to be signed in" | `npx expo login` on your computer, and sign in to Expo Go with the same account |
| App loads but shows "Can't reach the server" | Backend not running, wrong IP/port in `.env`, or phone on a different Wi-Fi. Restart `npm start` after editing `.env` |
| `npm ci` reports that the lockfile and `package.json` disagree | Run `npm install` to refresh `package-lock.json`, then commit both files |
| `npm install` fails with `ERESOLVE` or Expo reports mismatched packages | Run `npx expo install --fix`, then review and commit both `package.json` and `package-lock.json` |
| "Port 8081 is running this app in another window" | An old dev server is still running; stop it with Ctrl+C in its terminal, or accept the other port |
| Type errors about routes like `/tasks/[id]` | Start the dev server once (`npm start`); it regenerates the route types |
