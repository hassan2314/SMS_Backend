/**
 * Prepare DATABASE_URL for whichever process is about to use Prisma.
 * Local dev can omit DATABASE_URL_UNPOOLED; it is copied from DATABASE_URL.
 * Vercel Neon injects both: pooled DATABASE_URL for the app, direct
 * DATABASE_URL_UNPOOLED for migrations (Prisma directUrl).
 * A sleeping database should fail the request instead of hanging the process.
 * Query params already present on the URL are left unchanged.
 */
export function ensureDatabaseEnv() {
  if (!process.env.DATABASE_URL_UNPOOLED && process.env.DATABASE_URL) {
    process.env.DATABASE_URL_UNPOOLED = process.env.DATABASE_URL;
  }

  const url = process.env.DATABASE_URL;
  if (!url) return;

  const onVercel = process.env.VERCEL === "1";
  const params = [];
  if (!/[?&]connect_timeout=/.test(url)) params.push("connect_timeout=15");
  if (!/[?&]pool_timeout=/.test(url)) params.push("pool_timeout=15");
  if (!/[?&]connection_limit=/.test(url)) {
    params.push(onVercel ? "connection_limit=1" : "connection_limit=5");
  }
  if (onVercel && /pooler/i.test(url) && !/[?&]pgbouncer=/.test(url)) {
    params.push("pgbouncer=true");
  }
  if (params.length === 0) return;

  const joiner = url.includes("?") ? "&" : "?";
  process.env.DATABASE_URL = `${url}${joiner}${params.join("&")}`;
}
