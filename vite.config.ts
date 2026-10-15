import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

/**
 * En développement, sert /api/tutor, /api/ocr, /api/children et /api/family avec les mêmes fonctions que la production (dossier api/).
 * Les clés (CODECRAFT_API_KEY, MATHPIX_APP_ID, MATHPIX_APP_KEY…) sont lues dans .env, SANS préfixe VITE_ :
 * elles restent sur le serveur et ne partent jamais dans le navigateur.
 */
const SERVER_VARS = ["CODECRAFT_API_KEY", "TUTOR_API_KEY", "TUTOR_API_URL", "TUTOR_MODEL", "OCR_PROVIDER", "OCR_MODEL", "MATHPIX_APP_ID", "MATHPIX_APP_KEY", "SUPABASE_URL", "VITE_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];

function devApi(mode: string): Plugin {
  return {
    name: "dev-api",
    configureServer(server) {
      const env = loadEnv(mode, process.cwd(), "");
      for (const k of SERVER_VARS) if (env[k]) process.env[k] = env[k];
      for (const route of ["tutor", "ocr", "children", "family"]) {
        server.middlewares.use(`/api/${route}`, (req, res) => {
          let raw = "";
          req.on("data", (c) => { raw += c; if (raw.length > 6_000_000) req.destroy(); });
          req.on("end", async () => {
            const out = { status: 200 };
            const r = {
              status(c: number) { out.status = c; return r; },
              json(b: unknown) { res.statusCode = out.status; res.setHeader("content-type", "application/json"); res.end(JSON.stringify(b)); },
              setHeader(k: string, v: string) { res.setHeader(k, v); },
            };
            try {
              const mod = await server.ssrLoadModule(`/api/${route}.ts`);
              let body: unknown; try { body = raw ? JSON.parse(raw) : undefined; } catch { body = undefined; }
              await (mod.default as (a: unknown, b: unknown) => Promise<void>)({ method: req.method, body, headers: req.headers, socket: req.socket }, r);
            } catch {
              res.statusCode = 500; res.end(JSON.stringify({ error: "erreur serveur" }));
            }
          });
        });
      }
    },
  };
}

export default defineConfig(({ mode }) => ({ plugins: [react(), devApi(mode)] }));
