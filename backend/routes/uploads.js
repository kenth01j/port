const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const express = require("express");
const multer = require("multer");

const verifyToken = require("../middleware/verifyToken");

const router = express.Router();
const uploadDirectory =
  process.env.UPLOAD_DIR || path.join(__dirname, "..", "uploads");
const imageTypes = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDirectory,
  filename: (_req, file, callback) => {
    callback(null, `${crypto.randomUUID()}${imageTypes[file.mimetype]}`);
  },
});

const imageUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!imageTypes[file.mimetype]) {
      return callback(new Error("Unsupported image type."));
    }
    return callback(null, true);
  },
});

router.post("/", verifyToken, imageUpload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Select an image to upload." });
  }

  const backendUrl = process.env.BACKEND_PUBLIC_URL || `${req.protocol}://${req.get("host")}`;
  return res.status(201).json({
    imageUrl: `${backendUrl}/uploads/${req.file.filename}`,
  });
});

module.exports = router;
