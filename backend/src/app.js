require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

const normalizeOrigin = (origin) => origin.replace(/\/+$/, "");
const isRailwayAppOrigin = (origin) => {
  try {
    const url = new URL(origin);
    return url.protocol === "https:" && url.hostname.endsWith(".up.railway.app");
  } catch (_error) {
    return false;
  }
};

const frontendUrlFallback = process.env.NODE_ENV === "production" ? "" : "http://localhost:5173";
const configuredFrontendUrls = [process.env.FRONTEND_URL, process.env.FRONTEND_URLS]
  .filter(Boolean)
  .join(",");
const allowedOrigins = (configuredFrontendUrls || frontendUrlFallback)
  .split(",")
  .map((origin) => origin.trim())
  .map(normalizeOrigin)
  .filter(Boolean);
const allowRailwayOrigins =
  process.env.NODE_ENV === "production" || Boolean(process.env.RAILWAY_ENVIRONMENT);

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      const isAllowedOrigin =
        !origin ||
        allowedOrigins.includes(normalizeOrigin(origin)) ||
        (allowRailwayOrigins && isRailwayAppOrigin(origin));

      if (isAllowedOrigin) {
        return callback(null, true);
      }

      const error = new Error("Not allowed by CORS");
      error.statusCode = 403;
      return callback(error);
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
if (process.env.NODE_ENV !== "test") {
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
}

app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "team-task-manager-api",
    message: "Backend is running. Use /api routes from the frontend.",
    health: "/api/health",
  });
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "team-task-manager-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api", taskRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
