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
  
  // Anti-Hibernation: Self-ping every 14 minutes
  const APP_URL = process.env["RENDER_EXTERNAL_URL"] || "https://carreira360.onrender.com/";
  setInterval(() => {
    fetch(APP_URL)
      .then(() => logger.info("Self-ping successful"))
      .catch((err) => logger.error({ err }, "Self-ping failed"));
  }, 14 * 60 * 1000);
});
