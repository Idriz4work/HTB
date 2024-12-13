const express = require("express");
const crypto = require("crypto");
const {
  createUser,
  getUserByEmail,
  updateUserPassword,
  getWeaponsByUserId,
  dispatchWeapon,
  createPasswordReset,
  getPasswordReset,
  deletePasswordReset,
  getUserById,
} = require("../database");
const {
  generateToken,
  verifyToken,
  transporter,
  authenticate,
} = require("../utils");
const { parseMarkdown } = require("../markdown");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("index.html", { title: "Armaxis" });
});

router.get("/reset-password", (req, res) => {
  res.render("reset-password.html");
});

router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).send("Email and password are required.");

  try {
    await createUser(email, password, "user");
    console.log("User registered successfully.");
    res.send("Registration successful.");
  } catch (err) {
    if (err.message.includes("UNIQUE constraint failed")) {
      return res.status(400).send("Email already registered.");
    }
    console.error("Registration error:", err);
    res.status(500).send("Error during registration.");
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Email and password are required.");
  }

  try {
    const user = await getUserByEmail(email);
    if (!user || user.password !== password) {
      console.log("Invalid credentials or user not found.");
      return res.status(401).send("Invalid credentials.");
    }

    const token = generateToken({ id: user.id, role: user.role });
    res.cookie("token", token, { httpOnly: true });
    res.send("Login Successful");
  } catch (err) {
    console.error("Database error during login:", err);
    res.status(500).send("Internal server error.");
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("token", { httpOnly: true });
  res.redirect("/");
});

router.get("/weapons/dispatch", authenticate, (req, res) => {
  const { role } = req.user;
  if (role !== "admin") return res.status(403).send("Access denied.");
  res.render("dispatch-weapon.html", {
    title: "Dispatch Weapon",
    user: req.user,
  });
});

router.post("/weapons/dispatch", authenticate, async (req, res) => {
  const { role } = req.user;
  if (role !== "admin") return res.status(403).send("Access denied.");

  const { name, price, note, dispatched_to } = req.body;
  if (!name || !price || !note || !dispatched_to) {
    return res.status(400).send("All fields are required.");
  }

  try {
    const parsedNote = parseMarkdown(note);

    await dispatchWeapon(name, price, parsedNote, dispatched_to);

    res.send("Weapon dispatched successfully.");
  } catch (err) {
    console.error("Error dispatching weapon:", err);
    res.status(500).send("Error dispatching weapon.");
  }
});

router.get("/weapons", authenticate, async (req, res) => {
  const userId = req.user.id;
  const user = await getUserById(userId);
  try {
    const weapons = await getWeaponsByUserId(user.email);

    res.render("weapons.html", {
      title: "Your Dispatched Weapons",
      weapons,
      user: req.user,
    });
  } catch (err) {
    console.error("Error fetching weapons:", err);
    res.status(500).send("Error fetching weapons.");
  }
});
router.post("/reset-password/request", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).send("Email is required.");

  try {
    const user = await getUserByEmail(email);
    if (!user) return res.status(404).send("User not found.");

    const resetToken = crypto.randomBytes(16).toString("hex");
    const expiresAt = Date.now() + 3600000;

    await createPasswordReset(user.id, resetToken, expiresAt);

    await transporter.sendMail({
      from: "noreply@frontier.com",
      to: email,
      subject: "Password Reset",
      text: `Use this token to reset your password: ${resetToken}`,
    });

    res.send("Password reset token sent to your email.");
  } catch (err) {
    console.error("Error processing reset request:", err);
    res.status(500).send("Error processing reset request.");
  }
});

router.post("/reset-password", async (req, res) => {
  const { token, newPassword, email } = req.body; // Added 'email' parameter
  if (!token || !newPassword || !email)
    return res.status(400).send("Token, email, and new password are required.");

  try {
    const reset = await getPasswordReset(token);
    if (!reset) return res.status(400).send("Invalid or expired token.");

    const user = await getUserByEmail(email);
    if (!user) return res.status(404).send("User not found.");

    await updateUserPassword(user.id, newPassword);
    await deletePasswordReset(token);

    res.send("Password reset successful.");
  } catch (err) {
    console.error("Error resetting password:", err);
    res.status(500).send("Error resetting password.");
  }
});

module.exports = router;
