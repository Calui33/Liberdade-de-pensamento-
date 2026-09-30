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
- Supabase synchronization behavior.
- Stripe flow behavior unless explicitly changed.

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

Firebase/Firestore is currently the primary datastore and authentication path.

Supabase is an auxiliary synchronization/analytics path through `syncToSupabase`.

The first extraction should not replace Firebase with Supabase because the current Firebase UID model and the proposed Supabase schema/RLS model are not equivalent.

## Existing refactor branch

The existing `refactor/safe-neural-services` branch should not be merged wholesale. Its `src/App.tsx` is not a complete replacement for the main application.

Reusable ideas from that branch can be evaluated individually after the standalone baseline works.

## Technical issues to isolate from personality work

- Client-side Gemini credentials.
- AI Studio key-selection dependency.
- Client-controlled credit deduction/admin bypass.
- Generic GitHub PAT proxy.
- Stripe success/cancel URL derived directly from request origin.
- Base64 images stored in Firestore.
- Chat documents growing toward Firestore document limits.
- Main App / neuralService return-contract mismatch for neural analysis.
- Hardcoded location fallback and browser locale assumptions.
- Potential Firestore composite-index requirements.

These are infrastructure/security/reliability concerns and must not be “fixed” by altering SKYNET4 personality prompts.

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
