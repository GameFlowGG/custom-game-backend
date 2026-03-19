const GAMEFLOW_API_URL = "https://dev.api.gameflow.gg/v1";

export interface GameServerAllocation {
  address: string;
  port: number;
  serverName: string;
}

export async function startGameServer(): Promise<GameServerAllocation> {
  const gameId = Deno.env.get("GAMEFLOW_GAME_ID");
  const apiKey = Deno.env.get("GAMEFLOW_API_KEY");

  if (!gameId || !apiKey) {
    throw new Error("GAMEFLOW_GAME_ID and GAMEFLOW_API_KEY must be set");
  }

  const response = await fetch(
    `${GAMEFLOW_API_URL}/games/${encodeURIComponent(gameId)}/servers`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Api-Key": apiKey,
      },
      body: JSON.stringify({ timeoutSeconds: 0 }),
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GameFlow server request failed (${response.status}): ${body}`);
  }

  const data = await response.json();
  const server = data.server;

  if (!server?.address || !server?.port) {
    throw new Error("GameFlow returned invalid server data");
  }

  return {
    address: server.address,
    port: server.port,
    serverName: server.name,
  };
}
