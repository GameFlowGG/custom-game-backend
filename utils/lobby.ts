import { kv } from "../db/kv.ts";
import type { Lobby } from "../types/lobby.ts";

export async function generateUniqueCode(): Promise<string> {
  let code: string;
  let attempts = 0;

  do {
    code = Math.floor(100000 + Math.random() * 900000).toString();
    attempts++;
    if (attempts > 100) {
      throw new Error("Failed to generate unique code");
    }
  } while ((await kv.get([`code:${code}`])).value !== null);

  return code;
}

export async function getLobby(lobbyId: string): Promise<Lobby | null> {
  const result = await kv.get<Lobby>([`lobby:${lobbyId}`]);
  return result.value;
}

export async function saveLobby(lobby: Lobby): Promise<void> {
  await kv.set([`lobby:${lobby.id}`], lobby);
  await kv.set([`code:${lobby.code}`], lobby.id);
}

export async function deleteLobby(lobby: Lobby): Promise<void> {
  await kv.delete([`lobby:${lobby.id}`]);
  await kv.delete([`code:${lobby.code}`]);
}

export async function getAllPublicLobbies(): Promise<Lobby[]> {
  const lobbies: Lobby[] = [];
  
  const entries = kv.list<Lobby>({ start: ["lobby:"], end: ["lobby;"] });

  for await (const entry of entries) {
    if (entry.value && !entry.value.isPrivate) {
      lobbies.push(entry.value);
    }
  }
  
  console.log(`📊 Returning ${lobbies.length} public lobbies`);

  return lobbies;
}

import type { Session } from "../types/session.ts";

export async function getSession(peerId: string): Promise<Session | null> {
  const result = await kv.get<Session>([`ws:session:${peerId}`]);
  return result.value;
}

export async function saveSession(peerId: string, session: Session): Promise<void> {
  await kv.set([`ws:session:${peerId}`], session);
}

export async function deleteSession(peerId: string): Promise<void> {
  await kv.delete([`ws:session:${peerId}`]);
}
