require("dotenv").config();

const http = require("http");
const { createRequire } = require("module");
const cors = require("cors");
const express = require("express");
const fs = require("fs");
const mongoose = require("mongoose");
const path = require("path");
const { pathToFileURL } = require("url");

const authRoutes = require("./routes/auth");
const portfolioRoutes = require("./routes/portfolio");
const uploadRoutes = require("./routes/uploads");

const app = express();
const port = process.env.PORT || 5173;
const frontendDirectory = path.resolve(__dirname, "../frontend");
const frontendBuildDirectory = path.join(frontendDirectory, "dist");
const uploadDirectory =
  process.env.UPLOAD_DIR || path.join(__dirname, "uploads");

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is required in the backend environment.");
}

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is required in the backend environment.");
}

app.use(
  cors({
    origin: (process.env.FRONTEND_URL || "http://localhost:5173")
      .split(",")
      .map((origin) => origin.trim()),
  }),
);
app.use(express.json({ limit: "1mb" }));
fs.mkdirSync(uploadDirectory, { recursive: true });
app.use("/uploads", express.static(uploadDirectory));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});
app.use("/api/auth", authRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/uploads", uploadRoutes);

async function mountFrontend(httpServer) {
  if (process.env.NODE_ENV === "production") {
    const indexPath = path.join(frontendBuildDirectory, "index.html");
    if (!fs.existsSync(indexPath)) {
      throw new Error("Build the frontend before starting in production.");
    }

    app.use(express.static(frontendBuildDirectory));
    app.get("*", (req, res, next) => {
      if (
        req.path === "/api" ||
        req.path.startsWith("/api/") ||
        req.path === "/uploads" ||
        req.path.startsWith("/uploads/")
      ) {
        return next();
      }
      res.sendFile(indexPath, (error) => {
        if (error) next(error);
      });
    });
    return null;
  }

  const frontendRequire = createRequire(
    path.join(frontendDirectory, "package.json"),
  );
  const vitePath = frontendRequire.resolve("vite");
  const { createServer: createViteServer } = await import(
    pathToFileURL(vitePath).href
  );
  const vite = await createViteServer({
    configFile: path.join(frontendDirectory, "vite.config.js"),
    root: frontendDirectory,
    server: {
      middlewareMode: true,
      hmr: { server: httpServer },
    },
    appType: "spa",
  });

  app.use(vite.middlewares);
  return vite;
}

async function start() {
  const httpServer = http.createServer(app);
  let vite;

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected!");
    vite = await mountFrontend(httpServer);
    app.use((err, _req, res, _next) => {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ message: "Image must be 5 MB or smaller." });
      }
      if (err.message === "Unsupported image type.") {
        return res.status(400).json({ message: err.message });
      }
      console.error(err);
      res.status(500).json({ message: "An unexpected server error occurred." });
    });
    await new Promise((resolve, reject) => {
      httpServer.once("error", reject);
      httpServer.listen(port, resolve);
    });
    console.log(`Portfolio app listening on http://localhost:${port}`);
  } catch (error) {
    if (vite) await vite.close();
    await mongoose.disconnect();
    console.error("Could not start the portfolio app:", error);
    process.exitCode = 1;
    return;
  }

  async function shutdown() {
    httpServer.close();
    if (vite) await vite.close();
    await mongoose.disconnect();
  }

  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

start();
