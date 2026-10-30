require("dotenv").config();

const cors = require("cors");
const express = require("express");
const fs = require("fs");
const mongoose = require("mongoose");
const path = require("path");

const authRoutes = require("./routes/auth");
const portfolioRoutes = require("./routes/portfolio");
const uploadRoutes = require("./routes/uploads");

const app = express();
const port = process.env.PORT || 5000;
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

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(port, () => {
      console.log(`Backend listening on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Could not connect to MongoDB:", error);
    process.exit(1);
  });
