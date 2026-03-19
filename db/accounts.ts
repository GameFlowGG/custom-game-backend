import { getDatabase } from "./db.ts";
import type { Account } from "../types/account.ts";

initAccountsTable();

function initAccountsTable() {
  const db = getDatabase();
  db.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      discord_id TEXT UNIQUE,
      discord_username TEXT,
      discord_avatar TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `);
}
export function getAccountById(id: string): Account | null {
  const db = getDatabase();
  const result = db.prepare("SELECT * FROM accounts WHERE id = ?")
    .value<[string, string, string | null, string | null, string | null, number, number]>(id);
  
  if (!result) return null;
  
  const account: Account = {
    id: result[0],
    username: result[1],
    created_at: result[5],
    updated_at: result[6],
  };

  if (result[2] && result[3]) {
    account.discord = {
      id: result[2],
      username: result[3],
      avatar: result[4],
    };
  }

  return account;
}

export function getAccountByDiscordId(discordId: string): Account | null {
  const db = getDatabase();
  const result = db.prepare("SELECT * FROM accounts WHERE discord_id = ?")
    .value<[string, string, string | null, string | null, string | null, number, number]>(discordId);
  
  if (!result) return null;
  
  const account: Account = {
    id: result[0],
    username: result[1],
    created_at: result[5],
    updated_at: result[6],
  };

  if (result[2] && result[3]) {
    account.discord = {
      id: result[2],
      username: result[3],
      avatar: result[4],
    };
  }

  return account;
}

export function createAccount(
  id: string,
  username: string,
  discordId?: string,
  discordUsername?: string,
  discordAvatar?: string | null,
): void {
  const db = getDatabase();
  const now = Date.now();
  db.prepare(`
    INSERT INTO accounts (id, username, discord_id, discord_username, discord_avatar, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, username, discordId || null, discordUsername || null, discordAvatar || null, now, now);
}
