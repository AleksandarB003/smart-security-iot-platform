import { createServer } from "node:http";
import { app } from "./app.js";
import { initWebSocket } from "./websocket.js";

const PORT = process.env.PORT ?? 3000;

const server = createServer(app);
initWebSocket(server);

server.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});