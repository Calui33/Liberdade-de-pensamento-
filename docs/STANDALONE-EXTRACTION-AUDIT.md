# Standalone Extraction Audit

## Objective

Extract the existing SKYNET4 OMNI-AI NEXO from its Google AI Studio environment while preserving its observable behavior and personality.

## Protected

- Main SKYNET4 OMNI-AI NEXO system instruction.
- SurrealHero identity prompt.
- RAW mode wording and temperature.
- Google Search grounding in text modes.
- Model assignments.
- Token limits and generation parameters.
- Voice, image, video and map model/tool configuration.
- Firebase authentication and Firestore data model during the first extraction phase.

## Infrastructure to migrate

### Google AI Studio dependency

The only explicit `window.aistudio` integration found in the main branch is in `src/App.tsx`, where API-key selection/status is handled.

This is an environment dependency, not the personality itself.

### Gemini key exposure

`vite.config.ts` currently defines `process.env.GEMINI_API_KEY` and `process.env.API_KEY` for the Vite client bundle. The application also constructs `GoogleGenAI` in browser code.

For the standalone architecture, Gemini credentials should move server-side. The client should call the existing Express backend.

### AI entry points

The current application has multiple Gemini entry points:

1. Main chat — `gemini-3-flash-preview`, Google Search, protected SKYNET4 system instruction.
2. SurrealHero text — `gemini-3-flash-preview`, Google Search, RAW/normal mode.
3. SurrealHero image — `gemini-3.1-flash-image-preview`.
4. Image generation — `gemini-3.1-flash-image-preview`.
5. Image analysis — `gemini-1.5-flash`.
6. Prompt enhancement — `gemini-1.5-flash`.
7. Neural context analysis — `gemini-1.5-flash`.
8. Manus engineering module — `gemini-1.5-pro`, temperature 0.2, topP 0.8, topK 40, maxOutputTokens 8192.
9. TTS — `gemini-2.5-flash-preview-tts`.
10. Video — `veo-3.1-fast-generate-preview`.
11. Map search — Google Maps grounding.

These should be migrated as named server capabilities rather than replaced with a generic personality rewrite.

## Data layer

Firebase/Firestore remains the primary authentication and persistence layer.

The application now accesses authentication and persistence through provider boundaries so Firebase can be replaced later without changing SKYNET4 behavior.

## Existing refactor branch

The existing `refactor/safe-neural-services` branch should not be merged wholesale. Its `src/App.tsx` is not a complete replacement for the main application.

Reusable ideas from that branch can be evaluated individually after the standalone baseline works.

## Technical issues to isolate from personality work

- Firestore stores generated image data as base64; an object-storage boundary may be appropriate if the personal vault grows.
- Firebase project identifiers retain legacy Google AI Studio naming; renaming the project is a separate migration and is not required for standalone runtime independence.
- The GitHub integration is intentionally optional and read-only.

## Extraction sequence

1. Lock personality/configuration — DONE on this branch.
2. Add server-side Gemini capability layer.
3. Migrate main text chat first, preserving prompt, model, tools and context.
4. Migrate image/analysis/prompt enhancement.
5. Migrate TTS.
6. Migrate video and operation polling.
7. Migrate map grounding.
8. Remove client Gemini key injection from Vite.
9. Remove AI Studio key-selection UI/dependency.
10. Run build/type checks and behavior regression checks.
11. Only then address independent security/data hardening.

## Invariant

No extraction commit may intentionally alter SKYNET4 identity, tone, mode semantics, specialist terminology, model selection, tool configuration, or generation parameters unless that change is separately identified and approved.


## Extraction progress — 2026-09-30

Completed on this branch:

- Main OMNI-AI text chat moved behind `/api/omni/chat` with the protected identity prompt, model, Search grounding and token limit preserved.
- Prompt enhancement, neural context analysis, image analysis and Manus moved behind server-side neural endpoints.
- Neural image generation and TTS moved behind server-side endpoints.
- SurrealHero text and image generation moved behind server-side endpoints with its protected mode wording and temperatures preserved.
- Daily wisdom and Google Maps grounding moved behind server-side endpoints.
- Veo generation and operation polling moved server-side; the browser still receives a playable Blob URL.
- Vite client-side Gemini key injection removed.
- AI Studio key-selection UI/dependency removed from the application surface.

Not yet validated by a real build/CI run because this repository currently reports no workflow/status checks for the extraction commits. Do not treat the branch as production-validated until a build/type check is run.
