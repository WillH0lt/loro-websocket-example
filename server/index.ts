import { SimpleServer } from "loro-websocket/server";

const server = new SimpleServer({
  port: 8787,
  authenticate: async (_roomId, _crdt, auth) => {
    // return "read" | "write" | null
    return new TextDecoder().decode(auth) === "readonly" ? "read" : "write";
  },
  onLoadDocument: async (_roomId, _crdt) => null,
  onSaveDocument: async (_roomId, _crdt, _data) => {},
  saveInterval: 60_000,
});
await server.start();
// Later: await server.stop(); flushes any buffered frames before terminating clients
