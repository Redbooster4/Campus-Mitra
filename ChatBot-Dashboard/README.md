# React + Vite

## Sarvam voice transcription

Voice input uses the Sarvam Python SDK through `sarvam_voice_server.py`. Keep
the Sarvam subscription key on the server; do not put it in a `VITE_` variable
or commit it to the repository.

```bash
python -m pip install -r requirements-sarvam.txt
export SARVAM_API_KEY="your Sarvam subscription key"
python sarvam_voice_server.py
```

The voice API listens on port `3001`, separate from the dashboard API on port
`3000`. For deployment, set `VITE_VOICE_API_URL` to the deployed transcription
endpoint when building the frontend. Start the Vite app with `npm run dev`.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
