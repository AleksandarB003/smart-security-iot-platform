import { WebSocket } from "ws";

const ws = new WebSocket("ws://localhost:3000/ws");

ws.on("open", () => {
  console.log("Connected. Waiting for broadcasts...");
  console.log("(Leave the device simulator running in another terminal to see messages appear here)\n");
});

ws.on("message", (data) => {
  const message = JSON.parse(data.toString());
  console.log(`[${message.type}]`, message.data);
});

ws.on("error", (error) => {
  console.error("WebSocket error:", error);
});

ws.on("close", () => {
  console.log("Connection closed.");
});