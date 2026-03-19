import { generateAccessToken } from "../utils/auth.ts";
import {
  createAccount,
  getAccountByDiscordId,
} from "../db/accounts.ts";

interface DiscordUser {
  id: string;
  username: string;
  avatar: string | null;
}

export async function handleDiscordAuth(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    
    if (typeof body !== "object" || body === null) {
      return Response.json({ error: "Invalid request body" }, { status: 400 });
    }
    
    const discordToken = body.discordToken;

    if (!discordToken || typeof discordToken !== "string") {
      return Response.json(
        { error: "Discord token required" },
        { status: 400 }
      );
    }

    const discordResponse = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${discordToken}`,
      },
    });

    if (!discordResponse.ok) {
      return Response.json(
        { error: "Invalid Discord token" },
        { status: 401 }
      );
    }

    const discordUser = (await discordResponse.json()) as DiscordUser;

    // Check if account exists
    const existingAccount = getAccountByDiscordId(discordUser.id);

    if (existingAccount) {
      const accessToken = await generateAccessToken(
        existingAccount.id,
        existingAccount.discord?.id || existingAccount.id
      );

      return Response.json({
        accessToken: accessToken,
        account: {
          id: existingAccount.id,
          username: existingAccount.username,
          discord: existingAccount.discord,
        },
      });
    }

    // Create new account
    const accountId = crypto.randomUUID();
    const accessToken = await generateAccessToken(accountId, discordUser.id);

    const avatar = discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
      : null;

    createAccount(
      accountId,
      discordUser.username,
      discordUser.id,
      discordUser.username,
      avatar
    );

    return Response.json({
      accessToken: accessToken,
      account: {
        id: accountId,
        username: discordUser.username,
        discord: {
          id: discordUser.id,
          username: discordUser.username,
          avatar: avatar,
        },
      },
    });
  } catch (_error) {
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function handleAnonymousAuth(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    
    if (typeof body !== "object" || body === null) {
      return Response.json({ error: "Invalid request body" }, { status: 400 });
    }
    
    const username = body.username;

    if (!username || typeof username !== "string" || username.trim().length === 0) {
      return Response.json(
        { error: "Username required" },
        { status: 400 }
      );
    }

    // Create anonymous account
    const accountId = crypto.randomUUID();
    const accessToken = await generateAccessToken(accountId, accountId);

    createAccount(accountId, username.trim());

    return Response.json({
      accessToken: accessToken,
      account: {
        id: accountId,
        username: username.trim(),
      },
    });
  } catch (_error) {
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
