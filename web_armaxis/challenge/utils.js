const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const SECRET_KEY = crypto.randomBytes(69).toString("hex");

// JWT Token Management
function generateToken(payload, expiresIn = "1h") {
  return jwt.sign(payload, SECRET_KEY, { expiresIn });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch {
    return null;
  }
}

// Nodemailer Configuration
const transporter = nodemailer.createTransport({
  host: "localhost",
  port: 1025,
  secure: false,
});

// Authentication Middleware
function authenticate(req, res, next) {
  const token = req.cookies?.token; // Access token from cookies
  if (!token) return res.status(401).send("Token missing.");

  const decoded = verifyToken(token);
  if (!decoded) return res.status(403).send("Invalid token.");

  req.user = decoded;
  next();
}

module.exports = { generateToken, verifyToken, transporter, authenticate };
