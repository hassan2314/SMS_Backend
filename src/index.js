import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ensureDatabaseTimeouts } from "./db/databaseUrl.js";
import { migrateOnBoot, stopMigrate } from "./db/migrateOnBoot.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, "../.env"), quiet: true });
ensureDatabaseTimeouts();

const { default: app } = await import("./app.js");

const PORT = Number(process.env.PORT) || 4000;
const HOST = "0.0.0.0";

migrateOnBoot();

const server = app.listen(PORT, HOST, () => {
  console.log(`Server listening on ${HOST}:${PORT}`);
});

function shutdown(signal) {
  console.log(`Received ${signal}. Closing HTTP server.`);
  stopMigrate();
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 8_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
