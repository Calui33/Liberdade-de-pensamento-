# Firebase Provider Boundary

## Purpose

The application now treats Firebase as the current infrastructure implementation rather than as the application's architectural contract.

### Boundaries

- `src/services/auth/authProvider.ts` — application authentication boundary.
- `src/services/data/dataProvider.ts` — application persistence boundary.
- Firebase remains the active implementation behind both boundaries.

## Preservation rule

This layer is infrastructure-only. It does not modify SKYNET4 identity, personality prompts, specialist prompts, models, temperatures, token limits, tools, or generation behavior.

## Migration strategy

1. Keep Firebase as the working provider.
2. Move application code toward the provider boundaries.
3. Implement a replacement provider only when a real infrastructure migration is desired.
4. Validate behavior before and after any provider replacement.

The goal is replaceable infrastructure without rewriting the SKYNET4 neural behavior.
