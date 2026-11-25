# EZRA — Frontend

This folder contains the EZRA app. The app uses Expo and React Native. It supports goals, tasks, and progress without streaks.

## Stack

- [Expo](https://docs.expo.dev/) SDK 57, React Native, and TypeScript
- [Expo Router](https://docs.expo.dev/router/introduction/) for file-based navigation
- The app uses the Flask API in [`../backend`](../backend)

## Start the app

1. Install [Node.js](https://nodejs.org/) version 22.13 or newer. Install the **Expo Go** app on your phone.
2. Install the dependencies from the lockfile:
   ```bash
   cd frontend
   npm ci
   ```
3. Set the API URL:
   ```bash
   cp .env.example .env
   ```
   On a phone, replace `localhost` with your computer's LAN IP. For example: `http://192.168.1.20:5000`.
   Start the backend first. See the [backend guide](../backend/README.md). If macOS AirPlay uses port 5000, set `PORT=5001` for the backend. Use port 5001 in this file.
4. Start the development server. Scan its QR code with Expo Go:
   ```bash
   npm start
   ```
   Press `w` to open the web app. Press `i` to open the iOS simulator. Press `a` to open the Android emulator.

## Scripts

| Command             | Action |
| ------------------- | ------ |
| `npm start`         | Start the development server. |
| `npm run lint`      | Run ESLint. |
| `npm run typecheck` | Run the TypeScript check. |

See [DEPENDENCIES.md](DEPENDENCIES.md) for adding packages, checking SDK compatibility, and fixing install problems.

Read [CONTRIBUTING.md](CONTRIBUTING.md) for the change workflow and screen patterns.

## Project structure

```
src/
  app/                 # Routes (every file is a screen)
    _layout.tsx        # Root stack
    (tabs)/            # Bottom tabs: Today, Lists, Goals, Progress
    goals/new.tsx      # Create a goal
    goals/[id].tsx     # Edit or pause a goal; view its revision history
    tasks/new.tsx      # Create a task. ?goalId= links it to a goal.
    tasks/[id].tsx     # Edit, reschedule, or delete a task
  api/client.ts        # Typed client for the Flask /api endpoints
  components/          # Shared UI (Screen, Card, Button, CheckRow, Field, Chips, ...)
  constants/theme.ts   # Shared colors, spacing, and typography
  lib/                 # Local-date helpers, useApi / useMutation hooks, navigation
  types/models.ts      # Response types matching the backend
```

## Feature map

| ID    | Feature              | Where                                              | Status |
| ----- | -------------------- | -------------------------------------------------- | ------ |
| UI-01 | Today dashboard      | `src/app/(tabs)/index.tsx`                         | Done   |
| UI-02 | To-do list CRUD      | `src/app/(tabs)/lists.tsx`, `src/app/tasks/[id].tsx` | Done   |
| UI-03 | Goal setup + detail  | `src/app/(tabs)/goals.tsx`, `src/app/goals/`       | Done   |
| UI-04 | Recovery + progress  | `src/app/(tabs)/progress.tsx`                      | Done   |
| UI-05 | Local reminders      | not started                                        | Next   |

## Task fields

This table shows the task fields and where the app displays them:

| Requirement        | Backend field | Shown on                                    |
| ------------------ | ------------- | ------------------------------------------- |
| Task name          | `title`       | Task card, Add / Edit task                  |
| Small description  | `notes`       | Task card, Add / Edit task                  |
| Date of input      | `created_at`  | Task card ("Added")                         |
| Date updated       | `updated_at`  | Task card ("Updated"), once the backend sends it |
| Due date / goal    | `due_date`, `goal_id` | Lists filters and goal groups, set in Edit task |

The backend sends timestamps in UTC. The app shows them in the phone's local time. Date-only fields use the user's local calendar date. `updated_at` is optional in `src/types/models.ts`. The app works if the backend sends this field or omits it.

Each screen loads data from the backend when it gains focus. Each screen has loading, error, and empty states. The app disables buttons while a request runs. This prevents duplicate requests.
