# Contributing to the EZRA frontend

A short guide for your first frontend change. Setup is in [README.md](README.md); this covers the workflow and the patterns the screens already use.

## 1. Get it running (once)

1. Clone and install:
   ```bash
   git clone https://github.com/EZRA-Self-Care/ezra.git
   cd ezra/frontend && npm install
   ```
2. Start the backend (see [`../backend/README.md`](../backend/README.md) or [`../DOCKER.md`](../DOCKER.md)). On macOS, if port 5000 is taken by AirPlay, run it with `PORT=5001`.
3. Create `frontend/.env` with your computer's LAN IP (a phone can't reach `localhost`):
   ```
   EXPO_PUBLIC_API_URL=http://192.168.x.x:5001
   ```
4. Sign in to Expo on your computer (`npx expo login`) **and** in the Expo Go app on your phone, with the same account. Expo Go won't open the project otherwise.
5. `npm start`, then scan the QR code with your phone's camera. Keep the phone on the same Wi-Fi.

The dev server runs on your **computer**. Your phone only needs Expo Go.

## 2. Make a change

```bash
git switch main && git pull
git switch -c your-name/short-description   # e.g. logan/delete-confirmation
# ...edit...
npm run typecheck && npm run lint            # both must pass
git add <the files you changed>              # not `git add -A`
git commit -m "Add confirmation before deleting a task"
git push -u origin your-name/short-description
```

Then open a pull request into `main` on GitHub and ask someone to review it. Keep PRs small: one task per PR is ideal.

## 3. Patterns to follow

**Talking to the backend.** All requests go through [`src/api/client.ts`](src/api/client.ts). Field names match the backend exactly (`snake_case`), and types live in [`src/types/models.ts`](src/types/models.ts). If the backend changes a field, update both files in the same PR.

**Loading data on a screen.** Use `useApi` with a `useCallback`-wrapped loader. It reloads whenever the screen gains focus, so edits made on other screens show up:

```tsx
const load = useCallback(() => api.tasks.list(), []);
const { data, error, loading, reload } = useApi<Task[]>(load);
```

Always render the three states: `<Loading />`, `<ErrorState message={error} onRetry={reload} />`, and an `<EmptyState />` when there's nothing to show (see [`src/components/StateView.tsx`](src/components/StateView.tsx)).

**Saving data.** Wrap writes in `useMutation().run(...)` and pass `disabled={mutation.busy}` to the button, so a double tap can't send two requests. Show `mutation.error` with `<ErrorState />`.

**Forms that edit existing data.** Load first, then mount the form with its starting values (see `TaskForm` in [`src/app/tasks/[id].tsx`](src/app/tasks/[id].tsx)). Don't copy loaded data into state inside a `useEffect`; the lint rules reject it.

**Dates.** The backend expects the user's *local* date. Use the helpers in [`src/lib/dates.ts`](src/lib/dates.ts) (`localDate()`, `formatDue()`, `formatAdded()`, `formatUpdated()`) instead of `new Date().toISOString()`, which gives the UTC date and is wrong near midnight.

**After saving, go back** with `goBack('/lists')` from [`src/lib/navigation.ts`](src/lib/navigation.ts). It falls back to a tab when the screen was opened directly from a link.

**Styling.** Use the colors, spacing and text styles in [`src/constants/theme.ts`](src/constants/theme.ts) and the shared components (`Screen`, `Card`, `Button`, `Field`, `Chips`, `CheckRow`). Don't hard-code hex colors.

**Wording.** EZRA encourages instead of punishing: "Carried over", not "Overdue"; skipping has no penalty.

## 4. Adding a package

Use `npx expo install <package>`, never `npm install <package>`. It picks the version that matches our Expo SDK; plain `npm install` caused version conflicts before.

## Common problems

| Problem | Fix |
| --- | --- |
| Expo Go: "You need to be signed in" | `npx expo login` on your computer, and sign in to Expo Go with the same account |
| App loads but shows "Can't reach the server" | Backend not running, wrong IP/port in `.env`, or phone on a different Wi-Fi. Restart `npm start` after editing `.env` |
| `npm install` fails with `ERESOLVE` | Use `npx expo install <package>` instead |
| "Port 8081 is running this app in another window" | An old dev server is still running; stop it with Ctrl+C in its terminal, or accept the other port |
| Type errors about routes like `/tasks/[id]` | Start the dev server once (`npm start`); it regenerates the route types |
