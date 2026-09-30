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
- Google AI Studio UI/runtime dependency: removed.
- Neural provider implementation: server-side and replaceable through `NeuralProvider`.
- Browser Gemini credential exposure: removed.

### Firebase
Firebase remains the current authentication and primary persistence provider. Authentication and data access are now routed through application-level provider boundaries.

### GitHub
GitHub remains an optional owner-only, read-only integration through the Express API boundary.

## 3. Removed legacy AI Studio residue
- window.aistudio key-selection integration.
- Browser-side Gemini client initialization.
- Vite injection of Gemini credentials.
- AI Studio-specific HTML title.
- AI Studio-specific HMR comment/configuration.

## 4. Remaining independence work

1. Implement a non-Firebase authentication provider only if a real migration is desired.
2. Implement a non-Firebase persistence provider only if a real migration is desired.
3. Consider object storage for generated images if Firestore document size becomes a practical constraint.
4. Keep the SKYNET4 personality contract isolated from infrastructure migrations.

## Principle
**Infrastructure may be replaced. The SKYNET4 personality contract must remain stable.**