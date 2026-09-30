# SKYNET4 — Standalone Dependency Audit

This document distinguishes the SKYNET4 personality/core from the infrastructure services around it.

## 1. Core that is already standalone
- Protected SKYNET4 / OMNI-AI NEXO identity prompts.
- Surreal/Convergence mode and RAW mode behavior.
- Specialist model configuration and generation parameters.
- Server-side Gemini bridge.
- Owner-only application API.
- Owner-only Firestore data boundary.

## 2. External dependencies that remain intentional

### Gemini / Google AI APIs
The neural generation layer still depends on Google's Gemini/Veo APIs. This is the current model provider, not Google AI Studio itself.

The separation is:
- AI Studio UI/runtime: removed.
- Gemini provider API: retained.
- Provider credential: server-side only.
- Client: talks to the SKYNET4 backend instead of directly to Gemini.

Future provider independence should be implemented behind a server-side adapter, without changing the protected personality contract.

### Firebase / Firestore
Firebase remains the primary authentication and datastore.
The current Firebase project identifiers retain legacy AI Studio naming. This is metadata of the existing Firebase project, not an active AI Studio runtime dependency. Renaming or migrating the project would be a separate data/authentication migration and should not be performed as cleanup.

### Supabase
Supabase is secondary analytics/synchronization infrastructure. It is not the primary source of user state. It can be made optional or removed later after verifying that no personal workflow depends on the analytics records.

### Stripe
Stripe remains in the existing Express application for the original upgrade/payment flow. For a strictly personal deployment, this is a candidate for later removal, but it should be removed only as an explicit product decision rather than silently during infrastructure extraction.

### GitHub
GitHub is an authenticated, read-only backend proxy and is currently used by the application. It is not part of the neural personality.

### Netlify
Netlify is a deployment/runtime provider for the current hosted instance. The application remains a conventional Vite + Express application, so deployment can be moved later if the runtime requirements are preserved.

## 3. Removed legacy AI Studio residue
- window.aistudio key-selection integration.
- Browser-side Gemini client initialization.
- Vite injection of Gemini credentials.
- AI Studio-specific HTML title.
- AI Studio-specific HMR comment/configuration.

## 4. Remaining independence work
1. Introduce a server-side model-provider adapter so Gemini/Veo are replaceable without touching SKYNET4 behavior.
2. Audit and optionally remove Supabase analytics if not needed.
3. Decide whether Stripe has any purpose in a single-owner installation.
4. Evaluate Firebase migration only if true infrastructure ownership requires it; do not migrate merely to rename legacy project identifiers.
5. Evaluate moving from Firestore base64 image documents to object storage if the personal vault grows.

## Principle
**Infrastructure may be replaced. The SKYNET4 personality contract must remain stable.**