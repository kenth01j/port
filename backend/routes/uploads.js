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

router.delete("/:filename", verifyToken, async (req, res) => {
  const filename = req.params.filename;

  // Only allow filenames created by our upload system.
  if (!/^[0-9a-f-]{36}\.(jpg|png|webp|gif)$/i.test(filename)) {
    return res.status(400).json({ message: "Invalid image filename." });
  }

  const filePath = path.join(uploadDirectory, filename);

  try {
    await fs.promises.unlink(filePath);
    return res.json({ message: "Image deleted." });
  } catch (error) {
    if (error.code === "ENOENT") {
      return res.status(404).json({ message: "Image file not found." });
    }

    console.error("Could not delete image:", error);
    return res.status(500).json({ message: "Could not delete image." });
  }
});


module.exports = router;

