import type { Session } from "../types/session.ts";
import { verifyaccessToken } from "../utils/auth.ts";
import { saveSession } from "../utils/lobby.ts";
import {
  registerConnection,
  handleMessage,
  handleDisconnect,
} from "./handlers.ts";

let peerCounter = 0;

export function handleWebSocket(socket: WebSocket, request: Request): void {
  const peerId = `peer-${++peerCounter}-${Date.now()}`;
  registerConnection(peerId, socket);

  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  socket.onopen = async () => {
    console.log("WebSocket opened, token:", token?.substring(0, 20) + "...");
    
    if (!token) {
      socket.send(JSON.stringify({ type: "error", message: "Token required" }));
      socket.close();
      return;
    }

    const account = await verifyaccessToken(token);
    if (!account) {
      console.log("Token verification failed");
      socket.send(JSON.stringify({ type: "error", message: "Invalid token" }));
      socket.close();
      return;
    }

    console.log("Account verified:", account.id, account.username);

    const session: Session = {
      accountId: account.id,
      username: account.username,
      connectedAt: Date.now(),
    };

    await saveSession(peerId, session);

    socket.send(
      JSON.stringify({
        type: "connected",
        accountId: account.id,
        username: account.username,
      })
    );
  };

  socket.onmessage = async (event) => {
    await handleMessage(peerId, socket, event.data);
  };

  socket.onclose = async () => {
    await handleDisconnect(peerId);
  };

  socket.onerror = async () => {
    await handleDisconnect(peerId);
  };
}
