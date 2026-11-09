/**
 * Bound Prisma's Postgres connect and pool waits.
 * A sleeping free-tier database should fail the request, not hold the process open.
 * Values already present on DATABASE_URL are left unchanged.
 */
export function ensureDatabaseTimeouts() {
  const url = process.env.DATABASE_URL;
  if (!url) return;

  const params = [];
  if (!/[?&]connect_timeout=/.test(url)) params.push("connect_timeout=15");
  if (!/[?&]pool_timeout=/.test(url)) params.push("pool_timeout=15");
  if (!/[?&]connection_limit=/.test(url)) params.push("connection_limit=5");
  if (params.length === 0) return;

  const joiner = url.includes("?") ? "&" : "?";
  process.env.DATABASE_URL = `${url}${joiner}${params.join("&")}`;
}
