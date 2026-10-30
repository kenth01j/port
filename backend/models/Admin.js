const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    // A fixed document ID makes registration a one-time bootstrap operation.
    _id: { type: String, default: "portfolio-admin" },
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Admin", adminSchema);
