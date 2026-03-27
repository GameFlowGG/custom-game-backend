import { handleGetMe } from "./routes/accounts.ts";
import { handleGetLobbies } from "./routes/lobbies.ts";
import { handleWebSocket } from "./handlers/websocket.ts";
import { handleDiscordAuth, handleAnonymousAuth } from "./routes/auth.ts";

const PORT = Number(Deno.env.get("PORT")) || 3000;

async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const method = request.method;

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  if (pathname === "/_ws") {
    const upgrade = request.headers.get("upgrade") || "";

    if (upgrade.toLowerCase() === "websocket") {
      const { socket, response } = Deno.upgradeWebSocket(request);
      handleWebSocket(socket, request);
      return response;
    }
  }

  try {
    if (pathname === "/" && method === "GET") {
      return Response.json({
        message: "Game Backend API",
        version: "1.0.0",
        endpoints: {
          auth: [
            "/auth/discord", 
            "/auth/anonymous"
          ],
          accounts: [
            "/accounts/me"
          ],
          lobbies: [
            "/lobbies"
          ],
          websocket: "/_ws?token=JWT_TOKEN",
        },
      }, {
        status: 200,
        headers,
      });
    }

    if (pathname === "/auth/discord" && method === "POST") {
      const response = await handleDiscordAuth(request);
      return addCorsHeaders(response, headers);
    }

    if (pathname === "/auth/anonymous" && method === "POST") {
      const response = await handleAnonymousAuth(request);
      return addCorsHeaders(response, headers);
    }

    if (pathname === "/accounts/me" && method === "GET") {
      const response = await handleGetMe(request);
      return addCorsHeaders(response, headers);
    }

    if (pathname === "/lobbies" && method === "GET") {
      const response = await handleGetLobbies(request);
      return addCorsHeaders(response, headers);
    }

    return Response.json(
      { error: "Not Found" },
      {
        status: 404,
        headers,
      }
    );
  } catch (error) {
    console.error("Request error:", error);

    return Response.json(
      { error: "Internal Server Error" },
      {
        status: 500,
        headers,
      }
    );
  }
}

function addCorsHeaders(response: Response, corsHeaders: Record<string, string>): Response {
  const headers = new Headers(response.headers);

  for (const [key, value] of Object.entries(corsHeaders)) {
    headers.set(key, value);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

console.log(`Game Backend running on http://localhost:${PORT}`);
console.log(`WebSocket endpoint: ws://localhost:${PORT}/_ws?token=JWT_TOKEN`);

Deno.serve({ port: PORT }, handleRequest);
