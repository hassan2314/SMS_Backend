import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);

let migrateChild = null;

/**
 * Apply pending migrations without blocking the HTTP server.
 * Render's health check must get a response within a few seconds even when
 * Postgres is still waking up. The build command also runs `prisma migrate deploy`;
 * this pass covers a start that skipped the build.
 */
export function migrateOnBoot() {
  const enabled =
    process.env.RUN_MIGRATIONS === "true" ||
    (process.env.NODE_ENV === "production" &&
      process.env.RUN_MIGRATIONS !== "false");

  if (!enabled) return;
  if (!process.env.DATABASE_URL) {
    console.error(
      "Skipping prisma migrate deploy: DATABASE_URL is not set. The HTTP server will still listen."
    );
    return;
  }

  const timeoutMs = Number(process.env.MIGRATE_TIMEOUT_MS || 60_000);
  const prismaEntry = path.join(
    root,
    "node_modules",
    "prisma",
    "build",
    "index.js"
  );

  migrateChild = spawn(
    process.execPath,
    [prismaEntry, "migrate", "deploy"],
    {
      cwd: root,
      env: process.env,
      stdio: "inherit",
    }
  );

  const timer = setTimeout(() => {
    console.error(
      `prisma migrate deploy exceeded ${timeoutMs}ms. Stopping it so a slow database cannot hold this process. Run npm run db:migrate when Postgres is reachable.`
    );
    stopMigrate();
  }, timeoutMs);
  timer.unref();

  migrateChild.on("error", (error) => {
    clearTimeout(timer);
    console.error("Could not start prisma migrate deploy:", error.message);
  });

  migrateChild.on("exit", (code) => {
    clearTimeout(timer);
    migrateChild = null;
    if (code === 0) {
      console.log("prisma migrate deploy finished.");
      return;
    }
    console.error(
      `prisma migrate deploy exited with code ${code ?? "unknown"}. The HTTP server keeps running.`
    );
  });
}

export function stopMigrate() {
  if (migrateChild && !migrateChild.killed) {
    migrateChild.kill("SIGTERM");
  }
}
