import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "node:http";

let wss: WebSocketServer | null = null;

export function initWebSocket(server: Server): void {
  wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (socket) => {
    console.log("WebSocket client connected");
    socket.on("close", () => console.log("WebSocket client disconnected"));
  });
}

// Sends `{ type, data }` to every currently connected client. Silently a
// no-op if the server hasn't been initialized yet or no one is listening
// broadcasting is a best-effort push, not a guaranteed delivery channel.
export function broadcast(type: string, data: unknown): void {
  if (!wss) return;
  const message = JSON.stringify({ type, data });
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}