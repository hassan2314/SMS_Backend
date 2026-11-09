import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pkg from "@prisma/client";
import { ensureDatabaseTimeouts } from "./databaseUrl.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, "../../.env"), quiet: true });
ensureDatabaseTimeouts();

const { PrismaClient } = pkg;

const prisma = new PrismaClient();

export default prisma;
