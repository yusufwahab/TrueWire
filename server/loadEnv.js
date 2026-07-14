import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

// dotenv/config's default behavior loads `.env` relative to process.cwd() — which is the repo
// root when this server is started via `npm run server` from the root package.json, not this
// server/ folder. Load server/.env explicitly by absolute path so it works regardless of the
// working directory the process was launched from.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, ".env") });
