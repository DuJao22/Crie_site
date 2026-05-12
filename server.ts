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

// Fallback modules with complete curriculum and questions
const STATIC_MODULES = [
  { 
    id: 1,
    title: "MÓDULO 1 — Introdução à Engenharia de Prompt", 
    desc: "Explica o que é engenharia de prompt e como IA entende comandos.", 
    img: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop",
    content: `# MÓDULO 1: Domine a Mente da Máquina\n\nEste não é apenas um curso de "digitar textinho". Você está prestes a aprender como hackear a produtividade mundial usando Engenharia de Prompt.\n\n## 1. O que é Engenharia de Prompt? (AULA COMPLETA)\nEngenharia de Prompt é a ciência de estruturar comunicações para modelos de linguagem. Imagine que a IA é um gênio da lâmpada: se você pedir "dinheiro", ela pode te dar uma moeda de 1 centavo. Se você pedir "1 milhão de dólares em notas de 100 dentro de uma maleta preta na minha mesa agora", você consegue exatamente o que quer. \n\n### O Segredo dos Tokens\nA IA processa texto em pequenos pedaços chamados tokens. Cada palavra, espaço ou sinal de pontuação conta. Quando você é vago, a IA preenche as lacunas com o que é "estatisticamente mais provável", o que geralmente é o senso comum medíocre.\n\n## 2. Como a IA cria Landing Pages?\nEla não "desenha" como um humano. Ela escreve o **blueprint** da página. Ela entende que uma Landing Page precisa de um fluxo lógico (AIDA: Atenção, Interesse, Desejo, Ação). Quando ferramentas como Lovable interpretam seu prompt, elas estão transformando sua descrição em componentes de código reais.\n\n## 3. Ferramentas que você vai usar\n- **GitHub:** Sua conta bancária de código. Sem ele, você é apenas um amador. Com ele, você é um desenvolvedor.\n- **Lovable/Bolt:** Seus braços direitos. Eles fazem o trabalho pesado de codificação.\n- **Vercel:** O palco principal. Aqui seu site ganha vida para o mundo.\n\n--- \n*Dica de Ouro: Nunca peça para a IA "fazer um site". Peça para ela "atuar como um designer de conversão sênior".*`,
    free: 1,
    qs: [
      { q: "O que define a Engenharia de Prompt?", o: ["Codificar em binário", "Estruturar comandos para obter resultados precisos", "Desenhar layouts manualmente", "Instalar programas de IA"], c: 1 },
      { q: "Como a IA interpreta o texto?", o: ["Pelas cores", "Através de sentimentos", "Usando tokens e probabilidade estatística", "Lendo a mente do usuário"], c: 2 },
      { q: "O que acontece se você for vago no prompt?", o: ["A IA melhora o resultado sozinha", "O resultado será genérico e medíocre", "O computador trava", "Nada, a IA é perfeita"], c: 1 },
      { q: "Para que serve o GitHub?", o: ["Para postar fotos", "Para salvar e versionar projetos de forma profissional", "Como um chat de suporte", "Para comprar domínios"], c: 1 },
      { q: "O que é um 'Token'?", o: ["Uma senha de banco", "A menor unidade de processamento de texto da IA", "Um tipo de vírus", "O nome do modelo de IA"], c: 1 },
      { q: "Qual a função do Vercel?", o: ["Criar o código", "Hospedar o site e publicá-lo online", "Gerar prompts", "Editar vídeos"], c: 1 },
      { q: "O que ferramentas como Lovable fazem?", o: ["Apenas escrevem textos", "Transformam prompts em código e design funcional", "Limpam o cache do navegador", "Geram senhas"], c: 1 },
      { q: "O que é AIDA no contexto de Landing Pages?", o: ["Um tipo de código", "Atenção, Interesse, Desejo e Ação", "Um plugin do Chrome", "Nome de uma IA russa"], c: 1 },
      { q: "Por que definir uma 'Persona' (como Designer Sênior) ajuda?", o: ["Deixa a IA mais lenta", "Dá um contexto de qualidade e tom de voz à IA", "Não ajuda em nada", "É apenas para o usuário se sentir bem"], c: 1 },
      { q: "IA substitui totalmente o pensamento humano?", o: ["Sim, em 100% dos casos", "Não, o humano guia a estratégia e o refinamento", "Depende da velocidade da internet", "Sim, se o prompt for curto"], c: 1 }
    ]
  },
  { 
    id: 2,
    title: "MÓDULO 2 — Estrutura de uma Landing Page Profissional", 
    desc: "Ensinar a estrutura correta de uma landing page.", 
    img: "https://images.unsplash.com/photo-1551288049-bbbda536ad37?q=80&w=800&auto=format&fit=crop",
    content: `# MÓDULO 2: A Anatomia da Conversão Extrema\n\nUma Landing Page (LP) não é um site institucional. Uma LP tem uma missão única: **CONVERTER**. Se ela tem muitos links para outras páginas, ela falhou.\n\n## 1. Hero Section: Onde o Dinheiro é Feito\nVocê tem menos de 3 segundos para prender a atenção. A Hero Section precisa de:\n- **Headline:** Deve matar uma dor ou prometer um prazer imediato.\n- **Subheadline:** Explica o "como" de forma rápida.\n- **CTA (Call to Action):** O botão deve ser impossível de ignorar.\n\n## 2. A Hierarquia Visual\nO olho humano lê em padrão "F" ou "Z". Coloque as informações mais importantes (Logo, Headline, CTA) seguindo esse fluxo natural.\n\n## 3. Prova Social: O Efeito Manada\nO ser humano é social. Se ninguém mais comprou, ele não compra. Estampe depoimentos, logotipos de clientes famosos e números de resultados logo no início da página.\n\n## 4. Benefícios vs Características (ERRO COMUM)\n- **Característica:** "Este carro tem 200 cavalos".\n- **Benefício:** "Sinta o poder da aceleração e nunca mais se sinta inseguro em uma ultrapassagem".\n*Venda a transformação, não o objeto.*\n\n## 5. FAQ e Rodapé\nO FAQ não é só para perguntas. É para eliminar objeções finais. "Tem garantia?", "É seguro?", "Serve para mim?".`,
    free: 1,
    qs: [
      { q: "Qual a missão principal de uma Landing Page?", o: ["Mostrar a história da empresa", "Ter muitos links úteis", "Converter o visitante em lead ou cliente", "Ser apenas bonita"], c: 2 },
      { q: "Quanto tempo você tem para prender a atenção na Hero Section?", o: ["30 segundos", "Menos de 3 segundos", "5 minutos", "O tempo que o usuário quiser"], c: 1 },
      { q: "O deve conter uma Headline eficaz?", o: ["O CNPJ da empresa", "Uma promessa de valor clara ou solução de dor", "O menu do site", "Uma lista de parceiros"], c: 1 },
      { q: "Para que serve a Prova Social?", o: ["Para deixar o site colorido", "Para gerar confiança e autoridade através de outros usuários", "Para aumentar o tempo de carregamento", "Não serve para nada"], c: 1 },
      { q: "Qual a diferença entre Benefício e Característica?", o: ["Não há diferença", "Característica foca no item, Benefício foca na transformação", "Benefício é o nome do produto", "Característica é o preço"], c: 1 },
      { q: "O que é o padrão de leitura em 'F'?", o: ["Um tipo de fonte", "A forma como os olhos percorrem a página no início", "Um erro de design", "Uma técnica de pintura"], c: 1 },
      { q: "O que é um CTA?", o: ["Central de Tráfego", "Chamada para Ação (Botão principal)", "Código de Texto Antigo", "Curso de Tecnologia Aplicada"], c: 1 },
      { q: "Por que o FAQ é importante?", o: ["Para encher a página", "Para quebrar objeções e tirar dúvidas finais", "Para esconder informações", "Para links patrocinados"], c: 1 },
      { q: "Onde deve ficar o botão principal na Hero Section?", o: ["Escondido no rodapé", "Em destaque, geralmente logo abaixo da headline/subheadline", "No topo da página, bem pequeno", "Dentro de uma imagem"], c: 1 },
      { q: "Se uma página tem 20 botões diferentes apontando para lugares diferentes, ela é...", o: ["Uma excelente Landing Page", "Um site institucional ou portal, mas falha como LP", "Muito moderna", "Otimizada para SEO"], c: 1 }
    ]
  },
  { 
    id: 3,
    title: "MÓDULO 3 — Criando Prompts Profissionais", 
    desc: "Ensinar prompts detalhados para gerar páginas melhores.", 
    img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop",
    content: `# MÓDULO 3: A Técnica do Prompt Estruturado\n\nNeste módulo, saímos do amadorismo. Você vai aprender a "framework" de prompt que os profissionais de US$ 500/hora usam.\n\n## 1. A Framework C.R.O.P.S.\n- **C (Contexto):** "Você é um designer UI/UX focado em SaaS B2B."\n- **R (Role/Papel):** "Atue como o líder criativo da Apple."\n- **O (Objetivo):** "Crie uma landing page minimalista para um app de meditação."\n- **P (Parâmetros):** "Use cores pastéis, bordas ultra-arredondadas e fontes Serifadas."\n- **S (Saída):** "Gere o código React com Tailwind CSS."\n\n## 2. Refinamento Iterativo\nSe a IA gerar algo que você não gostou, não mude o prompt inteiro. Use ajustes: "Aumente o espaçamento entre as seções" ou "Transforme o botão em um gradiente de laranja para rosa".\n\n## 3. Prompts por Nicho\nVocê aprenderá a criar prompts específicos para:\n- **SaaS:** Foco em features e planos.\n- **E-commerce:** Foco em produto e urgência.\n- **Institucional:** Foco em história e serviços.\n- **Captura de Lead:** Foco total no formulário simplificado.`,
    free: 1,
    qs: [
      { q: "O que significa o 'C' na framework C.R.O.P.S.?", o: ["Cor", "Contexto", "Código", "Curso"], c: 1 },
      { q: "Qual a importância de definir um 'Papel' (Role) para a IA?", o: ["Nenhuma", "Define o tom e a qualidade técnica da resposta", "Deixa a resposta mais curta", "É apenas decorativo"], c: 1 },
      { q: "O que são 'Parâmetros' no prompt?", o: ["O preço do site", "Restrições visuais, cores, fontes, estilos", "O nome do cliente", "A senha do servidor"], c: 1 },
      { q: "Como fazer um refinamento iterativo?", o: ["Apagando tudo e começando do zero", "Dando comandos de pequenos ajustes sucessivos", "Gritando com o computador", "Pedindo para a IA parar"], c: 1 },
      { q: "Qual the foco de uma LP de Captura de Leads?", o: ["Mostrar muitas fotos de viagem", "Foco total no formulário e na promessa de valor", "Explicar 50 benefícios", "Vendas diretas com checkout"], c: 1 },
      { q: "O que é 'Refinamento'?", o: ["Não mexer mais na página", "Ajustar detalhes para atingir a perfeição", "Mudar de nicho", "Pedir reembolso"], c: 1 },
      { q: "Para que serve o 'S' (Saída) no C.R.O.P.S.?", o: ["Para sair do chat", "Para formatar como você quer receber a resposta", "Para salvar o prompt", "Para assinar o curso"], c: 1 },
      { q: "Em um prompt de SaaS, o que é fundamental?", o: ["Fotos de comida", "Seção de Features e Tabela de Planos", "História do criador", "Links para redes sociais"], c: 1 },
      { q: "Qual a vantagem de usar prompts específicos por nicho?", o: ["Resultados mais assertivos e alinhados com o público", "Economiza energia", "A IA trabalha mais rápido", "O GitHub prefere assim"], c: 0 },
      { q: "O que o 'O' do C.R.O.P.S representa?", o: ["Organização", "Objetivo (o que deve ser feito)", "Obrigação", "Otimização"], c: 1 }
    ]
  },
  { 
    id: 4,
    title: "MÓDULO 4 — Criando Landing Pages com IA", 
    desc: "Ensinar geração prática.", 
    img: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop",
    content: `# MÓDULO 4: Mão na Massa com Lovable\n\nFinalmente! Vamos gerar sua primeira página profissional. \n\n## 1. Configurando o Ambiente\nPrimeiro, você deve conectar seu GitHub ao Lovable. Isso garante que cada alteração que você fizer seja salva como um "commit". \n\n## 2. O Prompt Final\nUsaremos este prompt: "Crie uma landing page premium para um curso de tráfego pago. Use Dark Mode, gradientes violetas, depoimentos em cards flutuantes e um formulário de inscrição minimalista."\n\n## 3. O Refinamento Profissional\nPeça para a IA:\n- "Adicione uma seção de FAQ com acordeão."\n- "Mude as cores para um tema futurista azul petróleo."\n- "Certifique-se de que o botão de CTA tenha uma animação de pulso."`,
    free: 0,
    qs: [
      { q: "Qual ferramenta principal usamos para gerar as páginas visualmente?", o: ["Photoshop", "Lovable", "Paint", "Excel"], c: 1 },
      { q: "Por que conectar o GitHub ao Lovable?", o: ["Para que a IA possa ler seus e-mails", "Para salvar e versionar automaticamente cada mudança no código", "Para ganhar seguidores", "Não é necessário conectar"], c: 1 },
      { q: "O que é um 'Commit'?", o: ["Um tipo de erro", "Um registro de alteração salva no projeto", "Um botão de deletar", "Uma nova aba do navegador"], c: 1 },
      { q: "Como pedir um ajuste de cor específico?", o: ["Apagando o projeto", "Através de um novo comando no chat (ex: 'Mude para azul petróleo')", "Pintando a tela", "Reiniciando o computador"], c: 1 },
      { q: "O que 'Dark Mode' significa no design?", o: ["Site fora do ar", "Interface com fundo escuro e textos claros", "Site que só abre à noite", "Modo de segurança"], c: 1 },
      { q: "Para que serve a animação de pulso em um botão?", o: ["Para irritar o usuário", "Para chamar atenção visual para o CTA", "Para o site carregar mais rápido", "Para economizar bateria"], c: 1 },
      { q: "O que é um 'Acordeão' em uma seção de FAQ?", o: ["Um instrumento musical", "Um componente que expande e retrai para mostrar o texto", "Um tipo de imagem", "Um menu lateral"], c: 1 },
      { q: "Você precisa saber programar do zero para usar o Lovable?", o: ["Sim, obrigatoriamente", "Não, a IA cuida do código enquanto você guia com prompts", "Sim, precisa saber C++", "Não, mas precisa saber latim"], c: 1 },
      { q: "Qual o resultado de um prompt bem estruturado no Lovable?", o: ["Um erro 404", "Uma página profissional, funcional e responsiva", "Um arquivo PDF", "Uma imagem estática"], c: 1 },
      { q: "O que fazer se a primeira geração não for perfeita?", o: ["Desistir", "Usar prompts de refinamento detalhados", "Tirar um print e usar assim mesmo", "Pedir para um humano fazer"], c: 1 }
    ]
  },
  { 
    id: 5,
    title: "MÓDULO 5 — Estrutura Visual Premium", 
    desc: "Crie páginas com design moderno e tendências de 2024.", 
    img: "https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=800&auto=format&fit=crop",
    content: "# MÓDULO 5: Design que Impressiona\n\nEsqueça sites com cara de 2010. Aqui você aprende Glassmorphism, Neumorphism e as tendências visuais que dominam o mercado hoje.",
    free: 0 
  },
  { 
    id: 6,
    title: "MÓDULO 6 — IA + Copywriting", 
    desc: "Aprenda a criar textos que vendem com ajuda da IA.", 
    img: "https://images.unsplash.com/photo-1455849318743-b2233052fcff?q=80&w=800&auto=format&fit=crop",
    content: "# MÓDULO 6: Palavras que Vendem\n\nA Headline é 80% do trabalho. Aprenda a usar a IA para gerar variações de títulos irresistíveis e gatilhos mentais poderosos.",
    free: 0 
  },
  { 
    id: 7,
    title: "MÓDULO 7 — Domínio Profissional do GitHub", 
    desc: "Organize seus projetos como um desenvolvedor real.", 
    img: "https://images.unsplash.com/photo-1618401471353-b98aade1229a?q=80&w=800&auto=format&fit=crop",
    content: "# MÓDULO 7: Profissionalismo com GitHub\n\nEntenda Repositórios e Versionamento. Aprenda a organizar sua biblioteca de sites para clientes de forma segura e profissional.",
    free: 0 
  },
  { 
    id: 8,
    title: "MÓDULO 8 — Hospedagem e Publicação Grátis", 
    desc: "Coloque sua página no ar para o mundo todo ver.", 
    img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop",
    content: "# MÓDULO 8: Colocando no Ar\n\nDeploy em 1 clique com Vercel. Seu site online com SSL gratuito para sempre e performance de ponta.",
    free: 0 
  },
  { 
    id: 9,
    title: "MÓDULO 9 — Landing Pages Avançadas (SaaS e Apps)", 
    desc: "Crie estruturas complexas para softwares.", 
    img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop",
    content: "# MÓDULO 9: Landing Pages SaaS\n\nAprenda a criar páginas para softwares e aplicativos mobile que exigem um nível de design e funcionalidade superior.",
    free: 0 
  },
  { 
    id: 10,
    title: "MÓDULO 10 — O Negócio Freelancer de Landing Pages", 
    desc: "Como monetizar suas novas habilidades.", 
    img: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?q=80&w=800&auto=format&fit=crop",
    content: "# MÓDULO 10: O Negócio Profissional\n\nComo cobrar o valor justo pelo seu trabalho e como entregar projetos em tempo recorde usando o poder da IA.",
    free: 0 
  },
  { 
    id: 11,
    title: "MÓDULO 11 — Prompts Premium Secretos", 
    desc: "Acesse minha biblioteca pessoal de prompts de elite.", 
    img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop",
    content: "# MÓDULO 11: Prompts de Elite\n\nComandos avançados que geram resultados que parecem ter sido feitos por grandes agências de design.",
    free: 0 
  },
  { 
    id: 12,
    title: "MÓDULO 12 — Projeto Final e Portfólio", 
    desc: "Crie seu projeto mestre e publique seu portfólio.", 
    img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop",
    content: "# MÓDULO 12: Seu Diploma Prático\n\nCrie, publique e mostre ao mundo sua Landing Page de alta performance, pronta para atrair seus primeiros clientes.",
    free: 0 
  },
  { 
    id: 13,
    title: "BÔNUS 1 — Biblioteca de 100 Prompts Prontos", 
    desc: "Acelere sua criação com comandos validados.", 
    img: "https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?q=80&w=800&auto=format&fit=crop",
    content: "🚀 100 prompts prontos para copiar e colar, cobrindo diversos nichos e estilos visuais.",
    free: 0 
  },
  { 
    id: 14,
    title: "BÔNUS 2 — Templates Premium de Base", 
    desc: "Estruturas prontas para você começar.", 
    img: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=800&auto=format&fit=crop",
    content: "🚀 Seleção de templates de alta conversão para você usar como ponto de partida em qualquer projeto.",
    free: 0 
  },
  { 
    id: 15,
    title: "BÔNUS 3 — Estrutura de Agência de IA", 
    desc: "Como escalar e gerir múltiplos clientes.", 
    img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop",
    content: "🚀 Como vender serviços recorrentes, gerir expectativas de clientes e escalar seu negócio usando IA.",
    free: 0 
  }
];


async function initDatabase() {
  if (!CONNECTION_STRING) {
    console.warn("SQLITE_CLOUD_CONNECTION_STRING is missing in environment variables. Database features will be unavailable.");
    return;
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
      CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        order_index INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await db.sql`
      CREATE TABLE IF NOT EXISTS modules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER,
        title TEXT NOT NULL,
        description TEXT,
        content TEXT,
        image_url TEXT,
        is_free INTEGER DEFAULT 1,
        order_index INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses (id)
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

    // Bootstrap Initial Courses and Modules
    const coursesCount = await db.sql`SELECT COUNT(*) as count FROM courses`;
    if ((coursesCount[0] as any).count === 0) {
      console.log("Bootstrapping initial course: Introdução...");
      try {
        const courseRes = await db.sql`INSERT INTO courses (title, description, image_url, order_index) VALUES (
          'Introdução', 
          'A base fundamental para dominar a IA e criar Landing Pages de alta conversão.', 
          'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop', 
          0
        )`;
        const courseId = (courseRes as any).lastID || 1;

        console.log("Replacing course modules with new 15-module curriculum...");
        await db.sql`DELETE FROM quiz_results`;
        await db.sql`DELETE FROM questions`;
        await db.sql`DELETE FROM modules`;

        const courseModules = STATIC_MODULES;

        for (let i = 0; i < courseModules.length; i++) {
          const m = courseModules[i];
          const res = await db.sql`INSERT INTO modules (course_id, title, description, content, image_url, is_free, order_index) VALUES (${courseId}, ${m.title}, ${m.desc}, ${m.content}, ${m.img}, ${m.free}, ${i})`;
          const moduleId = (res as any).lastID || (i + 1);

          // Use real questions if provided
          if ((m as any).qs && (m as any).qs.length > 0) {
            for (const q of (m as any).qs) {
              await db.sql`INSERT INTO questions (module_id, question, options, correct_option) VALUES (
                ${moduleId}, 
                ${q.q}, 
                ${JSON.stringify(q.o)}, 
                ${q.c}
              )`;
            }
          }
        }
      } catch (innerError) {
        console.error("Error during course bootstrap:", innerError);
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
  // Pings the database every 5 minutes to prevent the free tier from sleeping
  setInterval(async () => {
    try {
      if (db) {
        await db.sql`SELECT 1`;
        console.log(`[${new Date().toISOString()}] Database keep-alive ping successful.`);
      } else if (CONNECTION_STRING) {
        console.log("Database was null, re-initializing...");
        db = new Database(CONNECTION_STRING);
        await db.sql`SELECT 1`;
      }
    } catch (e: any) {
      console.error("Database keep-alive ping failed:", e);
      if (CONNECTION_STRING && (e.message?.includes("unavailable") || e.message?.includes("disconnected") || e.message?.includes("connection"))) {
        console.log("Connection lost. Attempting to re-initialize SQLite Cloud database...");
        try {
          db = new Database(CONNECTION_STRING);
          await db.sql`SELECT 1`;
          console.log("Re-connection successful.");
        } catch (reconnectError) {
          console.error("Re-connection failed:", reconnectError);
          db = null; // Mark as null so next interval or request tries again
        }
      }
    }
  }, 5 * 60 * 1000);
} catch (error) {
  console.error("Failed to initialize SQLite Cloud database:", error);
  // Don't exit(1) if called from within background handler
}
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Logging & Health first for debugging
  app.use((req, res, next) => {
    console.log(`[HTTP] ${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });

  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      db_ready: !!db, 
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV
    });
  });

  // CORS and other middlewares
  app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }));
  app.use(express.json());
  app.use(cookieParser());

  // Start initialization in background
  console.log("Database initialization logic will run after port is bound...");
  
  // Helper for db access since db can be null or disconnected
  const getDb = async () => {
    if (!db) {
      if (CONNECTION_STRING) {
        console.log("Database instance was null. Re-initializing...");
        db = new Database(CONNECTION_STRING);
        try {
          await db.sql`SELECT 1`;
        } catch (e) {
          console.error("Re-initialization query failed:", e);
          throw new Error("Database connection failed");
        }
      } else {
        throw new Error("Database not initialized and no connection string found");
      }
    }
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
        const sessions = await (await getDb()).sql`SELECT * FROM sessions WHERE token = ${token} AND is_active = 1`;
        const session = sessions[0];
        if (!session) return res.status(403).json({ error: "Session revoked or expired" });

        await (await getDb()).sql`UPDATE sessions SET last_activity = CURRENT_TIMESTAMP WHERE id = ${session.id}`;
        
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
        const users = await (await getDb()).sql`SELECT is_admin FROM users WHERE id = ${req.user.id}`;
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

  app.get("/api/admin/users", authenticateAdmin, async (req, res) => {
    try {
      const users = await (await getDb()).sql`SELECT id, email, is_paid, is_admin, created_at FROM users ORDER BY created_at DESC`;
      res.json(users);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/modules", authenticateAdmin, async (req, res) => {
    try {
      const modules = await (await getDb()).sql`SELECT * FROM modules ORDER BY order_index ASC`;
      const modulesWithQuestions = await Promise.all(modules.map(async (m: any) => {
        const questions = await (await getDb()).sql`SELECT * FROM questions WHERE module_id = ${m.id}`;
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
      await (await getDb()).sql`
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
      await (await getDb()).sql`
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
      await (await getDb()).sql`DELETE FROM modules WHERE id = ${id}`;
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
      await (await getDb()).sql`DELETE FROM questions WHERE module_id = ${id}`;
      for (const q of questions) {
        await (await getDb()).sql`
          INSERT INTO questions (module_id, question, options, correct_option) 
          VALUES (${id}, ${q.question}, ${JSON.stringify(q.options)}, ${q.correct_option})
        `;
      }
      res.json({ message: "Questions updated" });
    } catch (e) {
      res.status(500).json({ error: "Failed to update questions" });
    }
  });

  app.get("/api/courses", authenticateToken, async (req, res) => {
    try {
      if (!db) {
        return res.json([{ id: 1, title: "Introdução", description: "O início da sua jornada.", image_url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop" }]);
      }
      const courses = await (await getDb()).sql`SELECT * FROM courses ORDER BY order_index ASC`;
      res.json(courses);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch courses" });
    }
  });

  app.get("/api/modules", authenticateToken, async (req: any, res) => {
    const { courseId } = req.query;
    try {
      if (!db) {
        return res.json(STATIC_MODULES);
      }
      
      let query = `SELECT * FROM modules`;
      if (courseId) {
        query += ` WHERE course_id = ${parseInt(courseId as string)}`;
      }
      query += ` ORDER BY order_index ASC`;
      
      const modules = await (await getDb()).sql(query as any);
      
      if (modules.length === 0) {
        return res.json(STATIC_MODULES);
      }
      const results = await (await getDb()).sql`SELECT module_id, passed, score FROM quiz_results WHERE user_id = ${req.user.id}`;
      
      const modulesWithStatus = modules.map((m: any, idx: number) => {
        const result = results.find((r: any) => r.module_id === m.id);
        
        // Logic: Module 0 in a course is always unlocked. 
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
      if (db) {
        const questions = await (await getDb()).sql`SELECT id, question, options FROM questions WHERE module_id = ${id}`;
        if (questions.length > 0) {
          return res.json(questions.map((q: any) => ({
            ...q,
            options: JSON.parse(q.options)
          })));
        }
      }
      
      // Fallback to STATIC_MODULES questions if DB is empty or still initializing
      const moduleId = parseInt(id);
      const fallbackModule = STATIC_MODULES.find(m => m.id === moduleId);
      
      if (fallbackModule) {
        if (fallbackModule.qs) {
          return res.json(fallbackModule.qs.map((q, idx) => ({
            id: (moduleId * 100) + idx,
            question: q.q,
            options: q.o
          })));
        } else {
          // Generic questions for other modules
          const genericQs = [];
          for (let i = 1; i <= 10; i++) {
            genericQs.push({
              id: (moduleId * 100) + i,
              question: `Pergunta de revisão ${i} sobre ${fallbackModule.title}`,
              options: ["Opção Correta (A)", "Opção Incorreta (B)", "Opção Incorreta (C)", "Opção Incorreta (D)"]
            });
          }
          return res.json(genericQs);
        }
      }

      res.status(404).json({ error: "Quiz not found" });
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch quiz" });
    }
  });

  app.post("/api/modules/:id/quiz/submit", authenticateToken, async (req: any, res) => {
    const { id } = req.params;
    const { answers } = req.body; // Array of indices
    const userId = req.user.id;

    try {
      let correctAnswers: number[] = [];
      
      if (db) {
        const questions = await (await getDb()).sql`SELECT correct_option FROM questions WHERE module_id = ${id} ORDER BY id ASC`;
        if (questions.length > 0) {
          correctAnswers = questions.map((q: any) => q.correct_option);
        }
      }
      
      // Fallback for verification too
      if (correctAnswers.length === 0) {
        const moduleId = parseInt(id);
        const fallbackModule = STATIC_MODULES.find(m => m.id === moduleId);
        if (fallbackModule) {
          if (fallbackModule.qs) {
            correctAnswers = fallbackModule.qs.map(q => q.c);
          } else {
            // Assume the first option (index 0) is correct for generic questions
            correctAnswers = new Array(10).fill(0);
          }
        }
      }

      if (correctAnswers.length === 0) return res.status(404).json({ error: "Quiz questions not found" });

      let score = 0;
      correctAnswers.forEach((correct, idx) => {
        if (answers[idx] === correct) {
          score++;
        }
      });

      const passed = score >= 7 ? 1 : 0;

      // Update quiz_results
      const existing = await (await getDb()).sql`SELECT id FROM quiz_results WHERE user_id = ${userId} AND module_id = ${id}`;
      if (existing.length > 0) {
        await (await getDb()).sql`
          UPDATE quiz_results SET score = ${score}, passed = ${passed}, completed_at = CURRENT_TIMESTAMP 
          WHERE id = ${(existing[0] as any).id}
        `;
      } else {
        await (await getDb()).sql`
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
      const results = await (await getDb()).sql`SELECT is_paid FROM users WHERE id = ${id}`;
      const user = results[0];
      if (!user) return res.status(404).json({ error: "User not found" });

      const newStatus = user.is_paid ? 0 : 1;
      await (await getDb()).sql`UPDATE users SET is_paid = ${newStatus} WHERE id = ${id}`;
      res.json({ message: "Status updated", is_paid: newStatus });
    } catch (e) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.delete("/api/admin/users/:id", authenticateAdmin, async (req, res) => {
    const { id } = req.params;
    try {
      await (await getDb()).sql`DELETE FROM sessions WHERE user_id = ${id}`;
      await (await getDb()).sql`DELETE FROM users WHERE id = ${id}`;
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
      await (await getDb()).sql`INSERT INTO users (email, password) VALUES (${email}, ${hashedPassword})`;
      
      const userResults = await (await getDb()).sql`SELECT id FROM users WHERE email = ${email}`;
      const user = userResults[0];
      
      const token = jwt.sign({ id: user.id, email: email }, JWT_SECRET, { expiresIn: "24h" });
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      await (await getDb()).sql`INSERT INTO sessions (user_id, token, expires_at) VALUES (${user.id}, ${token}, ${expiresAt})`;

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
      const results = await (await getDb()).sql`SELECT * FROM users WHERE email = ${email}`;
      const user = results[0];

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      await (await getDb()).sql`UPDATE sessions SET is_active = 0 WHERE user_id = ${user.id}`;
      
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "24h" });
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      await (await getDb()).sql`INSERT INTO sessions (user_id, token, expires_at) VALUES (${user.id}, ${token}, ${expiresAt})`;

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
      await (await getDb()).sql`UPDATE sessions SET is_active = 0 WHERE id = ${req.sessionId}`;
      res.clearCookie("auth_token");
      res.json({ message: "Logged out" });
    } catch (e) {
      res.status(500).json({ error: "Failed to logout" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    try {
      const results = await (await getDb()).sql`SELECT id, email, is_paid, is_admin FROM users WHERE id = ${req.user.id}`;
      const user = results[0];
      res.json({ user });
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch user data" });
    }
  });

  app.get("/api/progress", authenticateToken, async (req: any, res) => {
    try {
      const results = await (await getDb()).sql`SELECT * FROM progress WHERE user_id = ${req.user.id}`;
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
      const existing = await (await getDb()).sql`SELECT id FROM progress WHERE user_id = ${userId}`;
      if (existing.length > 0) {
        await (await getDb()).sql`
          UPDATE progress SET 
            current_step = ${current_step || 0}, 
            score = ${score || 0}, 
            answers = ${answersStr}, 
            last_updated = CURRENT_TIMESTAMP 
          WHERE user_id = ${userId}
        `;
      } else {
        await (await getDb()).sql`
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
    console.log("Initializing Vite middleware...");
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      console.log("Vite middleware initialized.");
    } catch (e) {
      console.error("Vite initialization failed:", e);
    }
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    console.log("Serving static files from:", distPath);
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  console.log(`Starting server on port ${PORT}...`);
  app.listen(PORT, "0.0.0.0", async () => {
    console.log(`>>> SERVER READY AND LISTENING ON PORT ${PORT} <<<`);
    
    // Initialize DB after the server is up and listening
    try {
      console.log("Starting background database initialization...");
      await initDatabase();
      console.log("Database initialized successfully.");
    } catch (error) {
      console.error("Database background initialization FAILED:", error);
      // We don't exit(1) here to keep the server alive for health checks/debugging
    }
  });
}

startServer();
