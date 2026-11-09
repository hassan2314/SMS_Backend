import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pkg from "@prisma/client";
import { ensureDatabaseEnv } from "./databaseUrl.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, "../../.env"), quiet: true });
ensureDatabaseEnv();

const { PrismaClient } = pkg;

const prisma = new PrismaClient();

export default prisma;
