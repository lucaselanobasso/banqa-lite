# BANQA Lite

Simulador de banco digital para estudo e portifolio, com frontend e backend separados.

## Stack

- Frontend: Vite + HTML + CSS + JavaScript Vanilla
- Backend: Node.js + Express
- Banco: SQLite com better-sqlite3

## Requisitos

- Node.js 24+
- npm 10+

## Como rodar

1. Instale dependencias na raiz:

```bash
npm install
```

2. Inicie frontend e backend juntos:

```bash
npm run dev
```

3. Acesse:

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Scripts

Raiz:

- `npm run dev`: sobe frontend e backend em paralelo
- `npm run postinstall`: instala dependencias de backend e frontend

Backend:

- `npm run dev`: inicia servidor com watch
- `npm start`: inicia servidor sem watch

Frontend:

- `npm run dev`: inicia Vite
- `npm run build`: gera build de producao
- `npm run preview`: serve build local

## Estrutura

- `frontend/`: aplicacao cliente
- `backend/`: API e camada de negocio
- `docs/`: especificacoes por modulo

Backend:

- `src/routes`: definicao das rotas REST
- `src/controllers`: adaptacao HTTP para services
- `src/services`: regras de negocio
- `src/repositories`: acesso ao SQLite
- `src/database`: bootstrap e schema
- `src/utils`: middlewares e helpers

## Banco de dados

- Arquivo: `backend/database.db`
- Criacao automatica ao iniciar backend
- Schema base: `backend/src/database/schema.sql`
- Migracoes leves em runtime: `backend/src/database/index.js`

## Funcionalidades implementadas

### Usuarios e sessao

- Cadastro com agencia e conta geradas automaticamente
- Login com token aleatorio (sem JWT)
- Sessao persistida em `sessions`
- Logout com revogacao da sessao

### Conta

- Visualizacao de nome, saldo, agencia e conta
- Extrato ordenado por data mais recente
- Filtros do extrato:
	- tipo
	- periodo (`startDate`, `endDate`)
	- busca (`search`) por descricao/referencia/tipo

### Operacoes financeiras

- Deposito
- Saque (sem permitir saldo negativo)
- Transferencia (origem e destino atualizados na mesma transacao SQLite)
- Toda operacao gera transacao em extrato

### Cartao virtual

- Numero mascarado
- Validade
- CVV mascarado
- Status (active/blocked)
- Bloqueio e desbloqueio persistidos no banco

### Administracao

- Reset total de dados (`POST /reset`)
- Mantem schema e remove registros de negocio

## Endpoints

Base URL: `http://localhost:3000/api`

Publicos:

- `GET /health`
- `POST /register`
- `POST /login`

Autenticados (Bearer Token):

- `POST /logout`
- `GET /account`
- `GET /transactions`
- `POST /deposit`
- `POST /withdraw`
- `POST /transfer`
- `GET /card`
- `PATCH /card/block`
- `PATCH /card/unblock`
- `POST /reset`

## Formato de autenticacao

Header obrigatorio nos endpoints autenticados:

```http
Authorization: Bearer <token>
```

## Observacoes de desenvolvimento

- Projeto sem ORM e sem TypeScript, conforme especificacao.
- Frontend consome apenas API REST em JSON.
- Operacoes criticas usam transacao SQLite para consistencia.
