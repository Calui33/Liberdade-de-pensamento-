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


## Deploy gratuito no Render

O projeto está preparado para ser publicado como um único **Web Service** no Render, mantendo o Express e o Vite no mesmo processo.

1. Crie um Web Service a partir deste repositório no Render.
2. Use o blueprint `render.yaml` ou configure manualmente:
   - **Runtime:** Node
   - **Build:** `npm ci && npm run build`
   - **Start:** `npm start`
   - **Health Check:** `/healthz`
3. Configure no Render as variáveis secretas definidas em `.env.example`, principalmente `GEMINI_API_KEY`, `FIREBASE_API_KEY` e `OWNER_EMAIL`.
4. Não coloque chaves reais no repositório. O `GEMINI_API_KEY` permanece exclusivamente no servidor.

> O plano gratuito do Render pode suspender o serviço após períodos de inatividade. O primeiro acesso depois disso pode levar algum tempo.

A configuração de deploy não altera prompts, personalidade, modelos ou parâmetros do núcleo neural.
