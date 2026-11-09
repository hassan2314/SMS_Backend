import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

dotenv.config({ path: path.join(root, ".env"), quiet: true });

const prismaBin = path.join(root, "node_modules", "prisma", "build", "index.js");
const placeholderUrl =
  "postgresql://placeholder:placeholder@127.0.0.1:5432/placeholder";

function fillDirectUrl() {
  if (!process.env.DATABASE_URL_UNPOOLED && process.env.DATABASE_URL) {
    process.env.DATABASE_URL_UNPOOLED = process.env.DATABASE_URL;
  }
}

function runPrisma(args) {
  const result = spawnSync(process.execPath, [prismaBin, ...args], {
    cwd: root,
    env: process.env,
    stdio: "inherit",
  });
  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const command = process.argv[2];
const databaseUrl = process.env.DATABASE_URL;

if (command === "generate") {
  if (!process.env.DATABASE_URL) process.env.DATABASE_URL = placeholderUrl;
  fillDirectUrl();
  runPrisma(["generate"]);
} else if (command === "build") {
  if (!databaseUrl) {
    process.env.DATABASE_URL = placeholderUrl;
    fillDirectUrl();
    runPrisma(["generate"]);
    console.log("DATABASE_URL is not set; skipped prisma migrate deploy.");
  } else {
    fillDirectUrl();
    runPrisma(["generate"]);
    runPrisma(["migrate", "deploy"]);
  }
} else if (command === "migrate" || command === "seed" || command === "setup") {
  if (!databaseUrl) {
    console.error(`DATABASE_URL is required for ${command}.`);
    process.exit(1);
  }
  fillDirectUrl();
  if (command === "migrate" || command === "setup") {
    runPrisma(["migrate", "deploy"]);
  }
  if (command === "seed" || command === "setup") {
    runPrisma(["db", "seed"]);
  }
} else {
  console.error(
    "Usage: node scripts/prisma-cli.js <generate|build|migrate|seed|setup>"
  );
  process.exit(1);
}
