import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { Database } from "@sqlitecloud/drivers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import { MercadoPagoConfig, Preference } from 'mercadopago';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-for-dev-only";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const MP_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN;
const CONNECTION_STRING = process.env.SQLITE_CLOUD_CONNECTION_STRING;

const client = MP_ACCESS_TOKEN ? new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN }) : null;

// Initialize SQLite Cloud database
// Note: We'll initialize it properly inside startServer after checking the connection string
let db: Database | null = null;

async function initDatabase() {
  if (!CONNECTION_STRING) {
    console.error("SQLITE_CLOUD_CONNECTION_STRING is missing in environment variables.");
    process.exit(1);
  }

  try {
    db = new Database(CONNECTION_STRING);
    console.log("Connecting to SQLite Cloud...");
    
    // Testing connection with a simple query
    await db.sql`SELECT 1`;
    console.log("SQLite Cloud connected successfully.");

    // --- Database Schema Setup ---
    await db.sql`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        is_paid INTEGER DEFAULT 0,
        is_admin INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await db.sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token TEXT NOT NULL,
        expires_at DATETIME NOT NULL,
        is_active INTEGER DEFAULT 1,
        last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );
    `;

    await db.sql`
      CREATE TABLE IF NOT EXISTS progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE NOT NULL,
        current_step INTEGER DEFAULT 0,
        score INTEGER DEFAULT 0,
        answers TEXT,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );
    `;

    // Support for existing tables that might be missing these columns
    const tableInfo = await db.sql`PRAGMA table_info(users)` as any[];
    const columns = tableInfo.map(c => c.name);

    if (!columns.includes("is_paid")) {
      await db.sql`ALTER TABLE users ADD COLUMN is_paid INTEGER DEFAULT 0`;
      console.log("Added is_paid column to users table");
    }

    if (!columns.includes("is_admin")) {
      await db.sql`ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0`;
      console.log("Added is_admin column to users table");
    }

    // Bootstrap Admin
    console.log("Checking admin bootstrap...");
    if (ADMIN_EMAIL && ADMIN_PASSWORD) {
      const results = await db.sql`SELECT * FROM users WHERE email = ${ADMIN_EMAIL}`;
      const existingAdmin = results[0];
      
      if (!existingAdmin) {
        const hashedPassword = bcrypt.hashSync(ADMIN_PASSWORD, 10);
        await db.sql`INSERT INTO users (email, password, is_paid, is_admin) VALUES (${ADMIN_EMAIL}, ${hashedPassword}, 1, 1)`;
        console.log(`Admin user ${ADMIN_EMAIL} bootstrapped successfully.`);
      } else {
        console.log(`Admin user ${ADMIN_EMAIL} already exists, checking admin rights...`);
        if (!existingAdmin.is_admin) {
          await db.sql`UPDATE users SET is_admin = 1, is_paid = 1 WHERE email = ${ADMIN_EMAIL}`;
          console.log(`Updated existing user ${ADMIN_EMAIL} to admin.`);
        }
      }
    }

    // --- Keep Alive Ping ---
    // Pings the database every 10 minutes to prevent the free tier from sleeping
    setInterval(async () => {
      try {
        if (db) {
          await db.sql`SELECT 1`;
          console.log(`[${new Date().toISOString()}] Database keep-alive ping successful.`);
        }
      } catch (e) {
        console.error("Database keep-alive ping failed:", e);
      }
    }, 10 * 60 * 1000);

  } catch (error) {
    console.error("Failed to initialize SQLite Cloud database:", error);
    process.exit(1);
  }
}

async function startServer() {
  await initDatabase();
  
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }));
  app.use(express.json());
  app.use(cookieParser());

  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });

  // Helper for db access since db can be null (though unlikely after startServer awaits init)
  const getDb = () => {
    if (!db) throw new Error("Database not initialized");
    return db;
  };

  // --- Auth Middleware ---
  const authenticateToken = async (req: any, res: any, next: any) => {
    const token = req.cookies.auth_token;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    jwt.verify(token, JWT_SECRET, async (err: any, user: any) => {
      if (err) return res.status(403).json({ error: "Invalid token" });
      
      try {
        const sessions = await getDb().sql`SELECT * FROM sessions WHERE token = ${token} AND is_active = 1`;
        const session = sessions[0];
        if (!session) return res.status(403).json({ error: "Session revoked or expired" });

        await getDb().sql`UPDATE sessions SET last_activity = CURRENT_TIMESTAMP WHERE id = ${session.id}`;
        
        req.user = user;
        req.sessionId = session.id;
        next();
      } catch (e) {
        res.status(500).json({ error: "Internal server error" });
      }
    });
  };

  const authenticateAdmin = (req: any, res: any, next: any) => {
    authenticateToken(req, res, async () => {
      try {
        const users = await getDb().sql`SELECT is_admin FROM users WHERE id = ${req.user.id}`;
        const user = users[0];
        if (!user || !user.is_admin) {
          return res.status(403).json({ error: "Access denied. Admin only." });
        }
        next();
      } catch (e) {
        res.status(500).json({ error: "Internal server error" });
      }
    });
  };

  // --- API Routes ---

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.get("/api/admin/users", authenticateAdmin, async (req, res) => {
    try {
      const users = await getDb().sql`SELECT id, email, is_paid, is_admin, created_at FROM users ORDER BY created_at DESC`;
      res.json(users);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/users/:id/toggle-paid", authenticateAdmin, async (req, res) => {
    const { id } = req.params;
    try {
      const results = await getDb().sql`SELECT is_paid FROM users WHERE id = ${id}`;
      const user = results[0];
      if (!user) return res.status(404).json({ error: "User not found" });

      const newStatus = user.is_paid ? 0 : 1;
      await getDb().sql`UPDATE users SET is_paid = ${newStatus} WHERE id = ${id}`;
      res.json({ message: "Status updated", is_paid: newStatus });
    } catch (e) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.delete("/api/admin/users/:id", authenticateAdmin, async (req, res) => {
    const { id } = req.params;
    try {
      await getDb().sql`DELETE FROM sessions WHERE user_id = ${id}`;
      await getDb().sql`DELETE FROM users WHERE id = ${id}`;
      res.json({ message: "User deleted" });
    } catch (e) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      // SQLite Cloud might return metadata about the insert
      await getDb().sql`INSERT INTO users (email, password) VALUES (${email}, ${hashedPassword})`;
      
      const userResults = await getDb().sql`SELECT id FROM users WHERE email = ${email}`;
      const user = userResults[0];
      
      const token = jwt.sign({ id: user.id, email: email }, JWT_SECRET, { expiresIn: "24h" });
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      await getDb().sql`INSERT INTO sessions (user_id, token, expires_at) VALUES (${user.id}, ${token}, ${expiresAt})`;

      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.status(201).json({ message: "User created", user: { email, is_admin: 0, is_paid: 0 } });
    } catch (error: any) {
      if (error.message && error.message.includes("UNIQUE constraint failed")) {
        return res.status(400).json({ error: "Email already registered" });
      }
      res.status(500).json({ error: "Internal server error during registration" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    try {
      const results = await getDb().sql`SELECT * FROM users WHERE email = ${email}`;
      const user = results[0];

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      await getDb().sql`UPDATE sessions SET is_active = 0 WHERE user_id = ${user.id}`;

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "24h" });
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      await getDb().sql`INSERT INTO sessions (user_id, token, expires_at) VALUES (${user.id}, ${token}, ${expiresAt})`;

      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.json({ message: "Logged in", user: { email: user.email, is_admin: user.is_admin, is_paid: user.is_paid } });
    } catch (error) {
      res.status(500).json({ error: "Internal server error during login" });
    }
  });

  app.post("/api/auth/logout", authenticateToken, async (req: any, res) => {
    try {
      await getDb().sql`UPDATE sessions SET is_active = 0 WHERE id = ${req.sessionId}`;
      res.clearCookie("auth_token");
      res.json({ message: "Logged out" });
    } catch (e) {
      res.status(500).json({ error: "Failed to logout" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    try {
      const results = await getDb().sql`SELECT id, email, is_paid, is_admin FROM users WHERE id = ${req.user.id}`;
      const user = results[0];
      res.json({ user });
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch user data" });
    }
  });

  app.get("/api/progress", authenticateToken, async (req: any, res) => {
    try {
      const results = await getDb().sql`SELECT * FROM progress WHERE user_id = ${req.user.id}`;
      const progress = results[0];
      if (progress) {
        res.json({
          ...progress,
          answers: progress.answers ? JSON.parse(progress.answers) : []
        });
      } else {
        res.json({ current_step: 0, score: 0, answers: [] });
      }
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch progress" });
    }
  });

  app.post("/api/progress", authenticateToken, async (req: any, res) => {
    const { current_step, score, answers } = req.body;
    const userId = req.user.id;
    const answersStr = JSON.stringify(answers || []);

    try {
      // Manual UPSERT for SQLite flavors that might not support ON CONFLICT yet or just to be safe
      const existing = await getDb().sql`SELECT id FROM progress WHERE user_id = ${userId}`;
      if (existing.length > 0) {
        await getDb().sql`
          UPDATE progress SET 
            current_step = ${current_step || 0}, 
            score = ${score || 0}, 
            answers = ${answersStr}, 
            last_updated = CURRENT_TIMESTAMP 
          WHERE user_id = ${userId}
        `;
      } else {
        await getDb().sql`
          INSERT INTO progress (user_id, current_step, score, answers, last_updated) 
          VALUES (${userId}, ${current_step || 0}, ${score || 0}, ${answersStr}, CURRENT_TIMESTAMP)
        `;
      }
      res.json({ message: "Progress saved" });
    } catch (error) {
      res.status(500).json({ error: "Failed to save progress" });
    }
  });

  const createPreferenceHandler = async (req: any, res: any) => {
    if (!client) {
      return res.status(500).json({ error: "Mercado Pago not configured on server" });
    }

    try {
      const host = req.get('x-forwarded-host') || req.get('host') || 'localhost:3000';
      const protocol = host.includes('localhost') ? 'http' : 'https';
      const baseUrl = `${protocol}://${host}`;
      
      const preference = new Preference(client);
      const body = {
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
          success: `${baseUrl}/api/checkout/verify`,
          failure: `${baseUrl}/dashboard`,
          pending: `${baseUrl}/dashboard`,
        },
        auto_return: 'approved',
        binary_mode: true,
      };

      const result = await preference.create({ body });
      res.json({ id: result.id, init_point: result.init_point });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to create payment preference", details: error.message });
    }
  };

  app.post("/api/checkout/create-preference", authenticateToken, createPreferenceHandler);
  app.get("/api/checkout/create-preference", authenticateToken, createPreferenceHandler);

  app.get("/api/checkout/verify", authenticateToken, async (req: any, res) => {
    const status = req.query.status || req.query.collection_status;
    if (status === 'success' || status === 'approved') {
      try {
        await getDb().sql`UPDATE users SET is_paid = 1 WHERE id = ${req.user.id}`;
        res.redirect('/dashboard?payment_confirmed=true');
      } catch (e) {
        res.redirect('/dashboard?payment_error=true');
      }
    } else {
      res.redirect('/dashboard?payment_failed=true');
    }
  });

  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: "API endpoint not found", path: req.originalUrl });
  });

  app.use((err: any, req: any, res: any, next: any) => {
    console.error('Server Error:', err);
    res.status(500).json({ 
      error: "Internal Server Error", 
      message: err.message,
      path: req.path
    });
  });

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
