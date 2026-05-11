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

    await db.sql`
      CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        module_id INTEGER NOT NULL,
        question TEXT NOT NULL,
        options TEXT NOT NULL,
        correct_option INTEGER NOT NULL,
        FOREIGN KEY (module_id) REFERENCES modules (id)
      );
    `;

    await db.sql`
      CREATE TABLE IF NOT EXISTS quiz_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        module_id INTEGER NOT NULL,
        score INTEGER NOT NULL,
        passed INTEGER DEFAULT 0,
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (module_id) REFERENCES modules (id)
      );
    `;

    // Bootstrap Initial Modules for the New Landing Page Course
    const existingModules = await db.sql`SELECT COUNT(*) as count FROM modules`;
    // Force replacement with the exact 15 modules curriculum (12 modules + 3 bonuses)
    if ((existingModules[0] as any).count !== 15) {
      console.log("Replacing course modules with new 15-module curriculum (12 modules + 3 bonuses)...");
      try {
        await db.sql`DELETE FROM quiz_results`;
        await db.sql`DELETE FROM questions`;
        await db.sql`DELETE FROM modules`;
      } catch (e) {
        console.log("Tables might not exist yet or empty.");
      }

      const courseModules = [
        { 
          title: "MÓDULO 1 — Introdução à Engenharia de Prompt", 
          desc: "Explica o que é engenharia de prompt e como IA entende comandos.", 
          img: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop",
          content: "🎯 Objetivo: Explicar o que é engenharia de prompt e como IA entende comandos.\n\n📚 Aulas:\nAula 1 — O que é Engenharia de Prompt\nAula 2 — Como IA Cria Landing Pages\nAula 3 — Ferramentas Necessárias (GitHub, Lovable, Bolt.new, v0, Vercel)",
          free: 1 
        },
        { 
          title: "MÓDULO 2 — Estrutura de uma Landing Page Profissional", 
          desc: "Ensinar a estrutura correta de uma landing page e gatilhos de conversão.", 
          img: "https://images.unsplash.com/photo-1551288049-bbbda536ad37?q=80&w=800&auto=format&fit=crop",
          content: "🎯 Objetivo: Ensinar a estrutura correta de uma landing page.\n\n📚 Aulas:\nAula 1 — Anatomia de uma Landing Page (Hero, CTA, Benefícios, FAQ...)\nAula 2 — Psicologia de Conversão (Gatilhos mentais, escassez, autoridade)\nAula 3 — Design que Converte (Hierarquia visual, espaçamento, UX/UI)",
          free: 1 
        },
        { 
          title: "MÓDULO 3 — Criando Prompts Profissionais", 
          desc: "Ensinar prompts detalhados para gerar páginas melhores por nicho.", 
          img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop",
          content: "🎯 Objetivo: Ensinar prompts detalhados para gerar páginas melhores.\n\n📚 Aulas:\nAula 1 — Estrutura de Prompt Profissional\nAula 2 — Prompt Básico vs Avançado\nAula 3 — Prompts Estruturados (Barbearia, Restaurante, Agência, SaaS...)",
          free: 1 
        },
        { 
          title: "MÓDULO 4 — Criando Landing Pages com IA", 
          desc: "Ensinar geração prática usando a ferramenta Lovable.", 
          img: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop",
          content: "🎯 Objetivo: Ensinar geração prática.\n\n📚 Aulas:\nAula 1 — Criando Conta e Integração GitHub\nAula 2 — Gerando Primeira Página\nAula 3 — Refinando Resultado",
          free: 0 
        },
        { 
          title: "MÓDULO 5 — Estrutura Visual Premium", 
          desc: "Criar páginas modernas com design premium e responsividade.", 
          img: "https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=800&auto=format&fit=crop",
          content: "🎯 Objetivo: Criar páginas modernas.\n\n📚 Aulas:\nAula 1 — Design Premium (Glassmorphism, Gradientes, Sombras)\nAula 2 — Dark Mode\nAula 3 — Responsividade (Mobile First)",
          free: 0 
        },
        { 
          title: "MÓDULO 6 — IA + Copywriting", 
          desc: "Ensinar a criar headlines e CTAs que realmente vendem.", 
          img: "https://images.unsplash.com/photo-1455849318743-b2233052fcff?q=80&w=800&auto=format&fit=crop",
          content: "🎯 Objetivo: Ensinar páginas que vendem.\n\n📚 Aulas:\nAula 1 — Headlines Fortes\nAula 2 — CTA Profissional\nAula 3 — Estrutura de Conversão (Problema-Solução-Benefício)",
          free: 0 
        },
        { 
          title: "MÓDULO 7 — GitHub", 
          desc: "Salvar e versionar seus projetos de forma profissional.", 
          img: "https://images.unsplash.com/photo-1618401471353-b98aade1229a?q=80&w=800&auto=format&fit=crop",
          content: "🎯 Objetivo: Salvar projetos profissionalmente.\n\n📚 Aulas:\nAula 1 — Criando Conta GitHub\nAula 2 — Repositórios (commits, push, versionamento)\nAula 3 — Integração IA + GitHub",
          free: 0 
        },
        { 
          title: "MÓDULO 8 — Hospedagem Grátis", 
          desc: "Publicar suas páginas online e configurar domínios.", 
          img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop",
          content: "🎯 Objetivo: Publicar páginas online.\n\n📚 Aulas:\nAula 1 — Deploy na Vercel\nAula 2 — Domínio (grátis e personalizado)\nAula 3 — Atualizações Automáticas",
          free: 0 
        },
        { 
          title: "MÓDULO 9 — Landing Pages Avançadas", 
          desc: "Criação de páginas para nichos específicos e fluxos de venda.", 
          img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop",
          content: "🎯 Objetivo: Criar páginas mais profissionais.\n\n📚 Aulas:\nAula 1 — Landing Page SaaS\nAula 2 — Página de Produto\nAula 3 — Página de Captura\nAula 4 — Página de Checkout",
          free: 0 
        },
        { 
          title: "MÓDULO 10 — Estrutura Freelancer", 
          desc: "Como vender seus serviços, precificar e escalar sua produção.", 
          img: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?q=80&w=800&auto=format&fit=crop",
          content: "🎯 Objetivo: Ensinar monetização.\n\n📚 Aulas:\nAula 1 — Como Vender Landing Pages\nAula 2 — Precificação\nAula 3 — Escalando com IA",
          free: 0 
        },
        { 
          title: "MÓDULO 11 — Prompts Premium", 
          desc: "Prompts extremamente profissionais para resultados de alto nível.", 
          img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop",
          content: "🎯 Objetivo: Criar prompts extremamente profissionais.\n\n📚 Aulas:\nAula 1 — Estrutura Master Prompt\nAula 2 — Prompt para Conversão\nAula 3 — Prompt para SaaS\nAula 4 — Prompt para E-commerce",
          free: 0 
        },
        { 
          title: "MÓDULO 12 — Projeto Final", 
          desc: "Construção de uma LP Premium completa do zero ao deploy.", 
          img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop",
          content: "🎯 Objetivo: Criar projeto completo.\n\n📚 Projeto:\nLanding Page Premium Completa com Hero, CTA, FAQ, Depoimentos e Responsividade Total.",
          free: 0 
        },
        { 
          title: "BÔNUS 1 — Biblioteca de Prompts", 
          desc: "Mais de 100 prompts prontos para acelerar sua vida.", 
          img: "https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?q=80&w=800&auto=format&fit=crop",
          content: "🚀 100 prompts prontos para diversos nichos e necessidades.",
          free: 0 
        },
        { 
          title: "BÔNUS 2 — Templates Premium", 
          desc: "Estruturas verificadas que você pode clonar.", 
          img: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=800&auto=format&fit=crop",
          content: "🚀 Landing pages prontas para você usar como base nos seus projetos.",
          free: 0 
        },
        { 
          title: "BÔNUS 3 — Estrutura Agência", 
          desc: "Modelos de negócio para vender Landing Pages recorrentemente.", 
          img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop",
          content: "🚀 Como vender serviços, gerir clientes e escalar sua própria agência.",
          free: 0 
        },
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
