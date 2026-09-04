import "dotenv/config";

import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

const { Pool } = pg;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL não foi definida."
  );
}

const isLocalDatabase =
  databaseUrl.includes("localhost") ||
  databaseUrl.includes("127.0.0.1");

const pool = new Pool({
  connectionString: databaseUrl,

  ...(isLocalDatabase
    ? {}
    : {
        ssl: {
          rejectUnauthorized: false,
        },
      }),
});

export const db = drizzle(pool);