import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { Database } from "@sqlitecloud/drivers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-for-dev-only";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const CONNECTION_STRING = process.env.SQLITE_CLOUD_CONNECTION_STRING;

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
        is_paid INTEGER DEFAULT 1,
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

    await db.sql`
      CREATE TABLE IF NOT EXISTS modules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        content TEXT,
        image_url TEXT,
        is_free INTEGER DEFAULT 1,
        order_index INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Bootstrap Initial Modules for the New SaaS Course
    const existingModules = await db.sql`SELECT COUNT(*) as count FROM modules`;
    if ((existingModules[0] as any).count === 0) {
      console.log("Bootstrapping 15 course modules...");
      const courseModules = [
        { 
          title: "Módulo 1: Preparando Ambiente", 
          desc: "Ferramentas essenciais: GitHub, app.new, Render e VS Code.", 
          img: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=800&auto=format&fit=crop",
          content: "Ferramentas Necessárias:\n- GitHub: Salvar código\n- app.new: Criar sistema com IA\n- Render: Hospedagem grátis\n- VS Code: Editar código",
          free: 1 
        },
        { 
          title: "Módulo 2: Criando Conta no GitHub", 
          desc: "Passo a passo para configurar seu repositório remoto.", 
          img: "https://images.unsplash.com/photo-1618401471353-b98aade1229a?q=80&w=800&auto=format&fit=crop",
          content: "O GitHub será onde o código do Mini SaaS ficará salvo.\n\nPassos:\n1. Acesse github.com\n2. Clique em Sign Up\n3. Confirme seu email.",
          free: 1 
        },
        { 
          title: "Módulo 3: Criando Conta no app.new", 
          desc: "Acesso à plataforma de IA para geração de apps.", 
          img: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop",
          content: "Acesse app.new e faça login com seu Google ou GitHub para começar a usar a IA.",
          free: 1 
        },
        { 
          title: "Módulo 4: Estrutura Profissional do SaaS", 
          desc: "Aprenda sobre Frontend, Backend, Banco de Dados e API.", 
          img: "https://images.unsplash.com/photo-1551288049-bbbda536ad37?q=80&w=800&auto=format&fit=crop",
          content: "Estrutura Ideal:\n- Sistema de Usuários\n- Dashboard Moderno\n- Banco de Dados (SQLite)\n- Painel Admin",
          free: 0 
        },
        { 
          title: "Módulo 5: Criando o Mini SaaS com IA", 
          desc: "O prompt definitivo para gerar um sistema completo.", 
          img: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop",
          content: "Prompt Profissional:\n'Crie um Mini SaaS profissional usando Flask, SQLite3, HTML, CSS e Jinja2...'",
          free: 0 
        },
        { title: "Módulo 6: Entendendo a Estrutura", desc: "Análise das pastas e arquivos gerados pela IA.", img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800", content: "Entenda templates, static, routes e database.", free: 0 },
        { title: "Módulo 7: Melhorando o SaaS com IA", desc: "Prompts para Dark Mode, Responsividade e Design Premium.", img: "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=800", content: "A evoluçao do sistema através de novos prompts.", free: 0 },
        { title: "Módulo 8: Banco de Dados SQLite3", desc: "Salvando usuários, logs e planos.", img: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=800", content: "id, nome, email, senha e created_at.", free: 0 },
        { title: "Módulo 9: Integração com GitHub", desc: "Conectando o app.new ao GitHub para deploys.", img: "https://images.unsplash.com/photo-1556075798-4825dfabb46e?q=80&w=800", content: "git init, add e commit automático.", free: 0 },
        { title: "Módulo 10: Hospedagem no Render", desc: "Colocando seu sistema online definitivamente.", img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800", content: "Configurando Build e Start commands.", free: 0 },
        { title: "Módulo 11: Estrutura Visual", desc: "Glassmorphism, gradientes e dashboard premium.", img: "https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=800", content: "Design moderno estilo startup.", free: 0 },
        { title: "Módulo 12: Estrutura REAL de SaaS", desc: "Tornando sua aplicação escalável.", img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800", content: "Flask, APIs e Segurança.", free: 0 },
        { title: "Módulo 13: Melhorias Futuras", desc: "Stripe, Mercado Pago e integração com OpenAI.", img: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=800", content: "Evoluindo seu produto digital.", free: 0 },
        { title: "Módulo 14: Monetização", desc: "Como e onde vender seu Mini SaaS por nichos.", img: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?q=80&w=800", content: "Precificação e Nichos lucrativos.", free: 0 },
        { title: "Módulo 15: Encerramento", desc: "Parabéns! Você concluiu seu primeiro SaaS.", img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800", content: "Finalização e próximos passos na jornada IA.", free: 0 },
      ];

      for (let i = 0; i < courseModules.length; i++) {
        const m = courseModules[i];
        const res = await db.sql`INSERT INTO modules (title, description, content, image_url, is_free, order_index) VALUES (${m.title}, ${m.desc}, ${m.content}, ${m.img}, ${m.free}, ${i})`;
        const moduleId = (res as any).lastID || (i + 1);

        // Pre-create 10 dummy questions per module to allow passing
        for (let j = 1; j <= 10; j++) {
          await db.sql`INSERT INTO questions (module_id, question, options, correct_option) VALUES (
            ${moduleId}, 
            'Pergunta ${j} sobre ${m.title}?', 
            '["Alternativa A", "Alternativa B", "Alternativa C", "Alternativa D"]', 
            0
          )`;
        }
      }
    }

    // Support for existing tables that might be missing these columns
    const tableInfo = await db.sql`PRAGMA table_info(users)` as any[];
    const columns = tableInfo.map(c => c.name);

    if (!columns.includes("is_paid")) {
      await db.sql`ALTER TABLE users ADD COLUMN is_paid INTEGER DEFAULT 1`;
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

  app.get("/api/admin/modules", authenticateAdmin, async (req, res) => {
    try {
      const modules = await getDb().sql`SELECT * FROM modules ORDER BY order_index ASC`;
      const modulesWithQuestions = await Promise.all(modules.map(async (m: any) => {
        const questions = await getDb().sql`SELECT * FROM questions WHERE module_id = ${m.id}`;
        return {
          ...m,
          questions: questions.map((q: any) => ({
            ...q,
            options: JSON.parse(q.options)
          }))
        };
      }));
      res.json(modulesWithQuestions);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch modules" });
    }
  });

  app.post("/api/admin/modules", authenticateAdmin, async (req, res) => {
    const { title, description, content, image_url, is_free, order_index } = req.body;
    try {
      await getDb().sql`
        INSERT INTO modules (title, description, content, image_url, is_free, order_index) 
        VALUES (${title}, ${description}, ${content}, ${image_url}, ${is_free ? 1 : 0}, ${order_index || 0})
      `;
      res.status(201).json({ message: "Module created" });
    } catch (e) {
      res.status(500).json({ error: "Failed to create module" });
    }
  });

  app.put("/api/admin/modules/:id", authenticateAdmin, async (req, res) => {
    const { id } = req.params;
    const { title, description, content, image_url, is_free, order_index } = req.body;
    try {
      await getDb().sql`
        UPDATE modules SET 
          title = ${title}, 
          description = ${description}, 
          content = ${content},
          image_url = ${image_url}, 
          is_free = ${is_free ? 1 : 0}, 
          order_index = ${order_index} 
        WHERE id = ${id}
      `;
      res.json({ message: "Module updated" });
    } catch (e) {
      res.status(500).json({ error: "Failed to update module" });
    }
  });

  app.delete("/api/admin/modules/:id", authenticateAdmin, async (req, res) => {
    const { id } = req.params;
    try {
      await getDb().sql`DELETE FROM modules WHERE id = ${id}`;
      res.json({ message: "Module deleted" });
    } catch (e) {
      res.status(500).json({ error: "Failed to delete module" });
    }
  });

  app.post("/api/admin/modules/:id/questions", authenticateAdmin, async (req, res) => {
    const { id } = req.params;
    const { questions } = req.body; // Array of { question, options, correct_option }

    if (!Array.isArray(questions) || questions.length !== 10) {
      return res.status(400).json({ error: "Exactly 10 questions are required" });
    }

    try {
      await getDb().sql`DELETE FROM questions WHERE module_id = ${id}`;
      for (const q of questions) {
        await getDb().sql`
          INSERT INTO questions (module_id, question, options, correct_option) 
          VALUES (${id}, ${q.question}, ${JSON.stringify(q.options)}, ${q.correct_option})
        `;
      }
      res.json({ message: "Questions updated" });
    } catch (e) {
      res.status(500).json({ error: "Failed to update questions" });
    }
  });

  app.get("/api/modules", authenticateToken, async (req: any, res) => {
    try {
      const modules = await getDb().sql`SELECT * FROM modules ORDER BY order_index ASC`;
      const results = await getDb().sql`SELECT module_id, passed, score FROM quiz_results WHERE user_id = ${req.user.id}`;
      
      const modulesWithStatus = modules.map((m: any, idx: number) => {
        const result = results.find((r: any) => r.module_id === m.id);
        
        // Logic: Module 0 is always unlocked. 
        // Module N is unlocked if Module N-1 was passed.
        let locked = false;
        if (idx > 0) {
          const prevModule = modules[idx - 1];
          const prevResult = results.find((r: any) => r.module_id === prevModule.id);
          if (!prevResult || !prevResult.passed) {
            locked = true;
          }
        }

        return {
          ...m,
          locked,
          passed: result ? !!result.passed : false,
          score: result ? result.score : 0
        };
      });

      res.json(modulesWithStatus);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch modules" });
    }
  });

  app.get("/api/modules/:id/quiz", authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
      const questions = await getDb().sql`SELECT id, question, options FROM questions WHERE module_id = ${id}`;
      res.json(questions.map((q: any) => ({
        ...q,
        options: JSON.parse(q.options)
      })));
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch quiz" });
    }
  });

  app.post("/api/modules/:id/quiz/submit", authenticateToken, async (req: any, res) => {
    const { id } = req.params;
    const { answers } = req.body; // Array of indices
    const userId = req.user.id;

    try {
      const questions = await getDb().sql`SELECT correct_option FROM questions WHERE module_id = ${id}`;
      if (questions.length === 0) return res.status(404).json({ error: "Quiz not found" });

      let score = 0;
      questions.forEach((q: any, idx: number) => {
        if (answers[idx] === q.correct_option) {
          score++;
        }
      });

      const passed = score >= 7 ? 1 : 0;

      // Update quiz_results
      const existing = await getDb().sql`SELECT id FROM quiz_results WHERE user_id = ${userId} AND module_id = ${id}`;
      if (existing.length > 0) {
        await getDb().sql`
          UPDATE quiz_results SET score = ${score}, passed = ${passed}, completed_at = CURRENT_TIMESTAMP 
          WHERE id = ${(existing[0] as any).id}
        `;
      } else {
        await getDb().sql`
          INSERT INTO quiz_results (user_id, module_id, score, passed) 
          VALUES (${userId}, ${id}, ${score}, ${passed})
        `;
      }

      res.json({ score, passed, message: passed ? "Parabéns! Você passou." : "Infelizmente você não atingiu a nota mínima." });
    } catch (e) {
      res.status(500).json({ error: "Failed to submit quiz" });
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

      res.status(201).json({ message: "User created", user: { email, is_admin: 0, is_paid: 1 } });
    } catch (error) {
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
