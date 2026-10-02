# Firebase Provider Boundary

## Purpose

Firebase remains the authentication and persistence infrastructure, but SKYNET4 now uses a fresh application-owned persistence namespace.

### Boundaries

- `src/services/auth/authProvider.ts` — Google/Firebase authentication boundary.
- `src/services/data/dataProvider.ts` — application persistence boundary.
- `src/server/providers/serverDataProvider.ts` — server-side credit persistence boundary.

### Fresh persistence namespace

The application no longer reads or writes the legacy collections:

- `users`
- `chats`
- `images`
- `videos`
- `map_nodes`

The active collections are:

- `skynet4_users`
- `skynet4_chats`
- `skynet4_images`

The legacy collections are explicitly denied by the current Firestore rules.

## Preservation rule

This layer is infrastructure-only. It does not modify SKYNET4 identity, personality prompts, specialist prompts, models, temperatures, token limits, tools, or generation behavior.

## Reset rule

A persistence reset must never require rewriting the frontend or neural behavior. The provider boundary is the only application data layer that should change during future storage migrations.
