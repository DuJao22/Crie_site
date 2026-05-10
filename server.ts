import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { MercadoPagoConfig, Preference } from 'mercadopago';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-for-dev-only";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const MP_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN;

const client = MP_ACCESS_TOKEN ? new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN }) : null;
const db = new Database(path.join(process.cwd(), "platform.db"));

// --- Database Schema Setup ---
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    is_paid INTEGER DEFAULT 0,
    is_admin INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    is_active INTEGER DEFAULT 1,
    last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );
`);

// Support for existing tables that might be missing these columns
const tableInfo = db.prepare("PRAGMA table_info(users)").all() as any[];
const columns = tableInfo.map(c => c.name);

if (!columns.includes("is_paid")) {
  db.exec("ALTER TABLE users ADD COLUMN is_paid INTEGER DEFAULT 0");
  console.log("Added is_paid column to users table");
}

if (!columns.includes("is_admin")) {
  db.exec("ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0");
  console.log("Added is_admin column to users table");
}

// Bootstrap Admin
console.log("Checking admin bootstrap...");
if (ADMIN_EMAIL && ADMIN_PASSWORD) {
  try {
    const existingAdmin = db.prepare("SELECT * FROM users WHERE email = ?").get(ADMIN_EMAIL);
    if (!existingAdmin) {
      const hashedPassword = bcrypt.hashSync(ADMIN_PASSWORD, 10);
      db.prepare("INSERT INTO users (email, password, is_paid, is_admin) VALUES (?, ?, 1, 1)").run(ADMIN_EMAIL, hashedPassword);
      console.log(`Admin user ${ADMIN_EMAIL} bootstrapped successfully.`);
    } else {
      console.log(`Admin user ${ADMIN_EMAIL} already exists, checking admin rights...`);
      if (!(existingAdmin as any).is_admin) {
        db.prepare("UPDATE users SET is_admin = 1, is_paid = 1 WHERE email = ?").run(ADMIN_EMAIL);
        console.log(`Updated existing user ${ADMIN_EMAIL} to admin.`);
      }
    }
  } catch (error) {
    console.error("Error during admin bootstrap:", error);
  }
} else {
  console.log("Admin bootstrap skipped: ADMIN_EMAIL or ADMIN_PASSWORD not defined in env.");
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());
  app.use(cookieParser());

  // --- Auth Middleware ---
  const authenticateToken = (req: any, res: any, next: any) => {
    const token = req.cookies.auth_token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: "Invalid token" });
      
      // Verify session is still active in DB
      const session = db.prepare("SELECT * FROM sessions WHERE token = ? AND is_active = 1").get(token) as any;
      if (!session) return res.status(403).json({ error: "Session revoked or expired" });

      // Update last activity
      db.prepare("UPDATE sessions SET last_activity = CURRENT_TIMESTAMP WHERE id = ?").run(session.id);
      
      req.user = user;
      req.sessionId = session.id;
      next();
    });
  };

  const authenticateAdmin = (req: any, res: any, next: any) => {
    authenticateToken(req, res, () => {
      const user = db.prepare("SELECT is_admin FROM users WHERE id = ?").get(req.user.id) as any;
      if (!user || !user.is_admin) {
        return res.status(403).json({ error: "Access denied. Admin only." });
      }
      next();
    });
  };

  // --- API Routes ---

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Admin Routes
  app.get("/api/admin/users", authenticateAdmin, (req, res) => {
    const users = db.prepare("SELECT id, email, is_paid, is_admin, created_at FROM users ORDER BY created_at DESC").all();
    res.json(users);
  });

  app.post("/api/admin/users/:id/toggle-paid", authenticateAdmin, (req, res) => {
    const { id } = req.params;
    const user = db.prepare("SELECT is_paid FROM users WHERE id = ?").get(id) as any;
    if (!user) return res.status(404).json({ error: "User not found" });

    const newStatus = user.is_paid ? 0 : 1;
    db.prepare("UPDATE users SET is_paid = ? WHERE id = ?").run(newStatus, id);
    res.json({ message: "Status updated", is_paid: newStatus });
  });

  app.delete("/api/admin/users/:id", authenticateAdmin, (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM sessions WHERE user_id = ?").run(id);
    db.prepare("DELETE FROM users WHERE id = ?").run(id);
    res.json({ message: "User deleted" });
  });

  // 1. Initial Admin/User Registration (Open for demo/setup)
  app.post("/api/auth/register", async (req, res) => {
    const { email, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const info = db.prepare("INSERT INTO users (email, password) VALUES (?, ?)").run(email, hashedPassword);
      res.status(201).json({ message: "User created", id: info.lastInsertRowid });
    } catch (error: any) {
      if (error.message.includes("UNIQUE constraint failed")) {
        return res.status(400).json({ error: "Email already registered" });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // 2. Login with Single Session enforcement (simplified to prevent 403 confusion)
  app.post("/api/auth/login", async (req, res) => {
    console.log(`Login attempt for: ${req.body.email}`);
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    try {
      const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;

      if (!user || !(await bcrypt.compare(password, user.password))) {
        console.log(`Login failed for ${email}: Invalid credentials`);
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Automatically invalidate previous sessions to avoid "Already Online" 403s
      db.prepare("UPDATE sessions SET is_active = 0 WHERE user_id = ?").run(user.id);

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "24h" });
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      db.prepare("INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)").run(user.id, token, expiresAt);

      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: true, // Force secure in this environment
        sameSite: "none", // Better for iframe environments
        maxAge: 24 * 60 * 60 * 1000,
      });

      console.log(`Login success for ${email}`);
      res.json({ message: "Logged in", user: { email: user.email, is_admin: user.is_admin, is_paid: user.is_paid } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error during login" });
    }
  });

  // 3. Logout
  app.post("/api/auth/logout", authenticateToken, (req: any, res) => {
    db.prepare("UPDATE sessions SET is_active = 0 WHERE id = ?").run(req.sessionId);
    res.clearCookie("auth_token");
    res.json({ message: "Logged out" });
  });

  // 4. Me (Session Check)
  app.get("/api/auth/me", authenticateToken, (req: any, res) => {
    const user = db.prepare("SELECT id, email, is_paid, is_admin FROM users WHERE id = ?").get(req.user.id) as any;
    res.json({ user });
  });

  // 5. Mercado Pago Checkout
  app.post("/api/checkout/create-preference", authenticateToken, async (req: any, res) => {
    if (!client) {
      return res.status(500).json({ error: "Mercado Pago not configured on server" });
    }

    try {
      const preference = new Preference(client);
      const result = await preference.create({
        body: {
          items: [
            {
              id: 'ds-company-course',
              title: 'Acesso Vitalício: DS Company Study',
              quantity: 1,
              unit_price: 39.90,
              currency_id: 'BRL',
            }
          ],
          payer: {
            email: req.user.email,
          },
          external_reference: String(req.user.id),
          back_urls: {
            success: `${req.protocol}://${req.get('host')}/api/checkout/verify?status=success`,
            failure: `${req.protocol}://${req.get('host')}/dashboard?payment=failure`,
            pending: `${req.protocol}://${req.get('host')}/dashboard?payment=pending`,
          },
          auto_return: 'approved',
        }
      });

      res.json({ id: result.id, init_point: result.init_point });
    } catch (error) {
      console.error('MP Preference Error:', error);
      res.status(500).json({ error: "Failed to create payment preference" });
    }
  });

  // 6. Payment Verification (Simplified for this setup)
  app.get("/api/checkout/verify", authenticateToken, (req: any, res) => {
    const status = req.query.status;
    if (status === 'success') {
      db.prepare("UPDATE users SET is_paid = 1 WHERE id = ?").run(req.user.id);
      res.redirect('/dashboard?payment_confirmed=true');
    } else {
      res.redirect('/dashboard?payment_failed=true');
    }
  });

  // --- Error Handling ---
  app.use((err: any, req: any, res: any, next: any) => {
    console.error('Server Error:', err);
    res.status(500).json({ 
      error: "Internal Server Error", 
      message: err.message,
      path: req.path
    });
  });

  // --- Vite & Production Setup ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
