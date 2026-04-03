import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  // ============================================================
  // ANTI-HIBERNATION: Keep Render free tier alive
  // Pings the health endpoint every 5 minutes from the outside.
  // The self-ping goes out via the external URL so Render counts
  // it as real incoming traffic, resetting the 15-minute timer.
  // ============================================================
  const APP_URL = (process.env["RENDER_EXTERNAL_URL"] || "https://carreira360.onrender.com").replace(/\/$/, "");
  const HEALTH_URL = `${APP_URL}/api/healthz`;

  const doPing = () => {
    fetch(HEALTH_URL)
      .then((r) => logger.info({ status: r.status }, "Keep-alive ping OK"))
      .catch((e) => logger.warn({ err: e }, "Keep-alive ping failed"));
  };

  // First ping after 30 seconds (let the server fully start)
  setTimeout(doPing, 30 * 1000);

  // Then ping every 5 minutes
  setInterval(doPing, 5 * 60 * 1000);
});
