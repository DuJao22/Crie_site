# Landing Pages com IA — Engenharia de Prompt

Este projeto é uma plataforma de ensino para criação de landing pages profissionais utilizando Inteligência Artificial e Engenharia de Prompt.

## Como fazer o Deploy no Render.com

Para que o projeto funcione corretamente no Render, siga estas configurações:

1. **Service Type**: Web Service
2. **Runtime**: Node
3. **Build Command**: `npm install && npm run build`
4. **Start Command**: `npm start`

### Variáveis de Ambiente (Environment Variables)

Certifique-se de configurar as seguintes variáveis no painel do Render:

- `NODE_ENV`: production
- `JWT_SECRET`: (uma senha longa e aleatória)
- `ADMIN_EMAIL`: seu e-mail para acesso administrativo
- `ADMIN_PASSWORD`: sua senha para acesso administrativo
- `MERCADO_PAGO_ACCESS_TOKEN`: (opcional) seu token do Mercado Pago para pagamentos

## Desenvolvimento Local

1. Clone o repositório
2. Execute `npm install`
3. Execute `npm run dev`
4. Acesse `http://localhost:3000`
