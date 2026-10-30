const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Admin = require("../models/Admin");

async function register(req, res) {
  const { username, password } = req.body;

  if (
    typeof username !== "string" ||
    !username.trim() ||
    typeof password !== "string" ||
    password.length < 12
  ) {
    return res.status(400).json({
      message: "Provide a username and a password of at least 12 characters.",
    });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    await Admin.create({
      _id: "portfolio-admin",
      username: username.trim(),
      password: passwordHash,
    });
    return res.status(201).json({
      message: "Admin account created. You can now sign in.",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "An admin account already exists or that username is taken.",
      });
    }
    console.error("Admin registration failed:", error);
    return res.status(500).json({ message: "Could not create admin account." });
  }
}

async function login(req, res) {
  const { username, password } = req.body;

  if (typeof username !== "string" || typeof password !== "string") {
    return res.status(400).json({ message: "Username and password are required." });
  }

  try {
    const admin = await Admin.findOne({ username: username.trim() });
    const passwordMatches =
      admin && (await bcrypt.compare(password, admin.password));

    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    const token = jwt.sign(
      { adminId: admin._id },
      process.env.JWT_SECRET,
      { expiresIn: "12h" },
    );
    return res.json({ token });
  } catch (error) {
    console.error("Admin login failed:", error);
    return res.status(500).json({ message: "Could not sign in." });
  }
}

module.exports = { register, login };
