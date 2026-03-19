import { Database } from "@db/sqlite";

let db: Database | null = null;

export function getDatabase(): Database {
  if (!db) {
    db = new Database("game.db");
  }
  return db;
}
