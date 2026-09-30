# SKYNET4 OMNI-AI NEXO

Personal standalone instance of the SKYNET4 OMNI-AI Nexo.

The extraction from Google AI Studio is complete: the AI Studio runtime dependency was removed from the application, while the protected personality contract and model configuration remain intact.

## Architecture

- **Owner-only:** the API accepts authenticated requests only from the configured owner account.
- **Server-side AI credentials:** Gemini credentials are kept on the server and are not injected into the browser bundle.
- **Personal infrastructure:** Firebase provides authentication and persistence; Gemini provides the neural capabilities.
- **Personality preservation:** identity prompts, specialist prompts, modes, models and generation parameters are treated as protected project behavior.

## Run locally

**Prerequisites:** Node.js 22+

1. Install dependencies:
   `npm install`
2. Configure the server environment using `.env.local` (see `.env.example`).
3. Set the Firebase API key, owner email and server-side `GEMINI_API_KEY`.
4. Run:
   `npm run dev`

The development server runs the standalone application and its authenticated API on port 3000.

## Protected personality contract

See `docs/SKYNET4-PERSONALITY-CONTRACT.md` before changing any prompt, model, temperature, tool or token-limit configuration. Changes to those elements should be deliberate and reviewed separately from infrastructure work.
