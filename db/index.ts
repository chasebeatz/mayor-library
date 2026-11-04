// import postgres from "postgres";
// export const sql =
// postgres(process.env.DATABASE_URL!, {max: 1, prepare: false});


import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is missing. Check .env.local beside package.json."
  );
}

export const sql = postgres(databaseUrl, {
  max: 1,
  prepare: false,
});