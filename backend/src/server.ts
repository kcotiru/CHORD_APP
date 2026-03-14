// Load environment first — must be before any other import that reads process.env
import "./config/env";

import app from "./app";
import { env } from "./config/env";

const server = app.listen(env.PORT, () => {
  console.log(`
╔══════════════════════════════════════════════╗
║  🎵  ChordRepo API                           ║
║  Listening on http://localhost:${env.PORT}         ║
║  Environment: ${env.NODE_ENV.padEnd(29)}║
╚══════════════════════════════════════════════╝
  `);
});

// ── Graceful shutdown ─────────────────────────────────────────────────────────
const shutdown = (signal: string) => {
  console.log(`\n[${signal}] Shutting down gracefully…`);
  server.close(() => {
    console.log("HTTP server closed.");
    process.exit(0);
  });
  // Force exit after 10 s if connections are still open
  setTimeout(() => {
    console.error("Forced exit after timeout");
    process.exit(1);
  }, 10_000).unref();
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Promise Rejection:", reason);
  shutdown("UNHANDLED_REJECTION");
});

export default server;
