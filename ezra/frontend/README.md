# EZRA — Frontend

Expo (React Native) app for EZRA, a self-care app built on encouragement, not streaks.

## Stack

- [Expo](https://docs.expo.dev/) SDK 57 + React Native, TypeScript
- [Expo Router](https://docs.expo.dev/router/introduction/) for file-based navigation
- Talks to the Flask API in [`../backend`](../backend)

## Getting started

1. Install [Node.js](https://nodejs.org/) (LTS) and the **Expo Go** app on your phone.
2. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
3. Point the app at the backend:
   ```bash
   cp .env.example .env
   ```
   On a physical device, replace `localhost` with your computer's LAN IP (e.g. `http://192.168.1.20:5000`).
4. Start the dev server and scan the QR code with Expo Go:
   ```bash
   npm start
   ```
   Press `w` to open in a browser, `i` / `a` for iOS simulator / Android emulator.

## Scripts

| Command             | What it does          |
| ------------------- | --------------------- |
| `npm start`         | Start the dev server  |
| `npm run lint`      | Lint with ESLint      |
| `npm run typecheck` | Type-check with `tsc` |

Add packages with `npx expo install <pkg>` (not `npm install`) so versions match the Expo SDK.

## Project structure

```
src/
  app/                 # Routes (every file is a screen)
    _layout.tsx        # Root stack
    (tabs)/            # Bottom tabs: Today, Lists, Goals, Progress
    goals/new.tsx      # Create a goal
  api/client.ts        # Typed fetch wrapper for the Flask endpoints
  components/          # Shared UI (Screen, Card, Button)
  constants/theme.ts   # Colors, spacing, typography from the MVP design
  types/models.ts      # Goal, Task, Occurrence, Revision (integration contract)
```

## Feature map

| ID    | Feature              | Where                          |
| ----- | -------------------- | ------------------------------ |
| UI-01 | Today dashboard      | `src/app/(tabs)/index.tsx`     |
| UI-02 | To-do list CRUD      | `src/app/(tabs)/lists.tsx`     |
| UI-03 | Goal setup + detail  | `src/app/(tabs)/goals.tsx`, `src/app/goals/new.tsx` |
| UI-04 | Recovery + progress  | `src/app/(tabs)/progress.tsx`  |
| UI-05 | Local reminders      | not started                    |

Screens currently show placeholder content; wire them to `api` in `src/api/client.ts` as the backend endpoints land.
