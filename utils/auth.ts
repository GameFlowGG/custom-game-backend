import { getAccountById } from "../db/accounts.ts";
import type { Account } from "../types/account.ts";
import { create, getNumericDate, verify } from "djwt";

const JWT_SECRET = Deno.env.get("JWT_SECRET");

if (!JWT_SECRET) {
  console.warn("⚠️ JWT_SECRET not set, using default (NOT SECURE FOR PRODUCTION)");
}

const keyData = new TextEncoder().encode(
  JWT_SECRET || "your-secret-key-change-in-production"
);

const cryptoKey = await crypto.subtle.importKey(
  "raw",
  keyData,
  { name: "HMAC", hash: "SHA-256" },
  false,
  ["sign", "verify"]
);

export function generateAccessToken(accountId: string, discordId: string): Promise<string> {
  const payload = {
    accountId,
    discordId,
    exp: getNumericDate(60 * 60 * 24 * 30), // 30 days
  };

  return create({ alg: "HS256", typ: "JWT" }, payload, cryptoKey);
}

export async function verifyaccessToken(token: string): Promise<Account | null> {
  try {
    const payload = await verify(token, cryptoKey);

    const accountId = payload.accountId;
    
    if (typeof accountId !== "string") {
      console.log("❌ accountId is not a string:", typeof accountId, accountId);
      return null;
    }
    
    const account = getAccountById(accountId);
    console.log("🔍 Account lookup result:", account ? "found" : "not found");
    return account;
  } catch (error) {
    console.log("❌ Token verification failed:", error);
    return null;
  }
}

export function getAuthTokenFromHeaders(headers: Headers): string | null {
  const authHeader = headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}

export async function requireAuth(headers: Headers): Promise<Account> {
  const token = getAuthTokenFromHeaders(headers);
  if (!token) {
    throw new Error("Unauthorized");
  }

  const account = await verifyaccessToken(token);
  if (!account) {
    throw new Error("Invalid token");
  }

  return account;
}
