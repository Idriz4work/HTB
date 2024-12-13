const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const { promisify } = require("util");
const crypto = require("crypto");

const dbPath = path.resolve(__dirname, "database.sqlite");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Failed to connect to the database:", err);
  } else {
    console.log("Connected to the SQLite database.");
  }
});

const run = promisify(db.run.bind(db));
const get = promisify(db.get.bind(db));
const all = promisify(db.all.bind(db));
const exec = promisify(db.exec.bind(db));

async function initializeDatabase() {
  try {
    await run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email VARCHAR(255) UNIQUE,
            password VARCHAR(255),
            role VARCHAR(50)
        )`);

    await run(`CREATE TABLE IF NOT EXISTS weapons (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(255),
            price REAL,
            note TEXT,
            dispatched_to VARCHAR(255),
            FOREIGN KEY (dispatched_to) REFERENCES users (email)
        )`);

    await run(`CREATE TABLE IF NOT EXISTS password_resets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            token VARCHAR(64) NOT NULL,
            expires_at INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )`);

    const userCount = await get(`SELECT COUNT(*) as count FROM users`);
    if (userCount.count === 0) {
      const insertUser = db.prepare(
        `INSERT INTO users (email, password, role) VALUES (?, ?, ?)`,
      );
      const runInsertUser = promisify(insertUser.run.bind(insertUser));

      await runInsertUser(
        "admin@armaxis.htb",
        `${crypto.randomBytes(69).toString("hex")}`,
        "admin",
      );
      insertUser.finalize();
      console.log("Seeded initial users.");
    }
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

initializeDatabase();

async function createUser(email, password, role = "user") {
  const query = `INSERT INTO users (email, password, role) VALUES (?, ?, ?)`;
  try {
    const result = await run(query, [email, password, role]);
    return result;
  } catch (error) {
    throw error;
  }
}

async function getUserByEmail(email) {
  const query = `SELECT * FROM users WHERE email = ?`;
  try {
    const user = await get(query, [email]);
    return user;
  } catch (error) {
    throw error;
  }
}

async function getUserById(id) {
  const query = `SELECT * FROM users WHERE id = ?`;
  try {
    const user = await get(query, [id]);
    return user;
  } catch (error) {
    throw error;
  }
}

async function updateUserPassword(id, newPassword) {
  const query = `UPDATE users SET password = ? WHERE id = ?`;
  try {
    await run(query, [newPassword, id]);
  } catch (error) {
    throw error;
  }
}

async function getWeaponsByUserId(userId) {
  const query = `SELECT * FROM weapons WHERE dispatched_to = ?`;
  try {
    const weapons = await all(query, [userId]);
    return weapons;
  } catch (error) {
    throw error;
  }
}

async function dispatchWeapon(name, price, note, dispatched_to) {
  const query = `INSERT INTO weapons (name, price, note, dispatched_to) VALUES (?, ?, ?, ?)`;
  try {
    const result = await run(query, [name, price, note, dispatched_to]);
    return result;
  } catch (error) {
    throw error;
  }
}

async function createPasswordReset(userId, token, expiresAt) {
  const query = `INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)`;
  try {
    await run(query, [userId, token, expiresAt]);
  } catch (error) {
    throw error;
  }
}

async function getPasswordReset(token) {
  const query = `SELECT * FROM password_resets WHERE token = ? AND expires_at > ?`;
  try {
    const reset = await get(query, [token, Date.now()]);
    return reset;
  } catch (error) {
    throw error;
  }
}

async function deletePasswordReset(token) {
  const query = `DELETE FROM password_resets WHERE token = ?`;
  try {
    await run(query, [token]);
  } catch (error) {
    throw error;
  }
}

module.exports = {
  db,
  createUser,
  getUserByEmail,
  getUserById,
  updateUserPassword,
  getWeaponsByUserId,
  dispatchWeapon,
  createPasswordReset,
  getPasswordReset,
  deletePasswordReset,
};
