# Passe · Mercado de Jogadores

Aplicação fullstack do estudo de caso **SENAI/PE – CÓD. 237 DESENVOLVEDOR I (FULLSTACK)**: mercado de jogadores de uma liga fictícia, com cadastro de jogadores e clubes, compra com contrato de fidelidade, venda com multa e comissão, histórico de transações (com exportação CSV), escalação, partidas e classificação.

- **Backend:** NestJS 11 (Node.js 22 + TypeScript), Prisma 6 e PostgreSQL 16, em `backend/`
- **Frontend:** React 19 + Vite 7 (TypeScript), em `frontend/`

---

## 1. Pré-requisitos

| Ferramenta | Versão | Uso |
| --- | --- | --- |
| Node.js (com npm) | **22 LTS** (npm 10) | Backend e frontend |
| Docker Engine com Docker Compose v2 | Docker 24 ou superior | Sobe o PostgreSQL 16 (imagem pública `postgres:16-alpine`) |

O PostgreSQL não precisa ser instalado: ele sobe pelo Docker Compose no passo 3.

---

## 2. Banco de dados: criar e recriar do zero

O banco é criado pelas **migrations do Prisma** versionadas em `backend/prisma/migrations`. Ele começa vazio, sem jogadores, clubes, transações nem partidas.

```bash
# Na raiz do repositório: sobe o PostgreSQL
docker compose up -d db

# Na pasta backend: cria as tabelas
cd backend
cp .env.example .env
npm ci
npx prisma migrate deploy
```

Para **recriar o banco do zero** (apaga tudo e aplica as migrations de novo), com o banco no ar:

```bash
# Na pasta backend
npx prisma migrate reset --force
```

---

## 3. Instalar e executar (Ubuntu 24.04)

Execute na ordem, um comando por linha. Os servidores ficam em execução; use outro terminal para o passo seguinte.

```bash
# Terminal 1 — banco de dados (na raiz do repositório)
docker compose up -d db

# Terminal 1 — backend (a partir da raiz do repositório)
cd backend
cp .env.example .env
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
npm run start
```

- **Origem da API:** `http://localhost:3000` (o prefixo `/api/v1` é acrescentado pelo script; a API completa fica em `http://localhost:3000/api/v1`)

```bash
# Terminal 2 — frontend (a partir da raiz do repositório)
cd frontend
npm ci
npm run dev
```

- **URL do frontend:** `http://localhost:5173`

Os arquivos de trava `backend/package-lock.json` e `frontend/package-lock.json` estão versionados.

---

## 4. Variáveis de ambiente

### Backend (`backend/.env`, modelo em [`backend/.env.example`](backend/.env.example))

| Variável | Padrão no `.env.example` | Descrição |
| --- | --- | --- |
| `DATABASE_URL` | `postgresql://mercado:mercado@localhost:5432/mercado_jogadores?schema=public` | Conexão com o PostgreSQL do `docker-compose.yml` |
| `PORT` | `3000` | Porta HTTP da API |
| `CORS_ORIGIN` | `http://localhost:5173` | Única origem liberada no CORS (a do frontend) |

### Frontend (opcional, modelo em [`frontend/.env.example`](frontend/.env.example))

| Variável | Padrão | Descrição |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:3000/api/v1` | Endereço da API com o prefixo. Sem `.env`, o frontend usa o padrão. |

---

## 5. Estrutura de pastas e bibliotecas

```text
.
├── docker-compose.yml        # PostgreSQL (e, no perfil "app", backend e frontend)
├── backend/
│   ├── prisma/               # schema.prisma e migrations (7 tabelas do enunciado)
│   ├── src/
│   │   ├── common/           # regras gerais: dinheiro, texto, datas, validação, filtro de erros, logs
│   │   ├── players/          # jogadores: controller, service, schemas, overall, valor base e de mercado
│   │   ├── clubs/            # clubes: criação, listagem, elenco, valor do elenco e patrimônio
│   │   ├── market/           # compra e venda (taxa, limite de caixa, multa, comissão)
│   │   ├── transactions/     # histórico, summary e exportação CSV
│   │   ├── league/           # escalação, motor da partida, partidas e classificação
│   │   └── prisma/           # PrismaService (acesso ao banco)
│   └── test/                 # testes unitários das regras de cálculo
└── frontend/
    └── src/
        ├── api/              # camada de acesso à API (fetch) e tipos
        ├── components/       # componentes reutilizáveis: tabela, campo, modal, avisos, paginação
        ├── features/         # telas: players, clubs, league
        ├── hooks/            # useApiResource (carregar dados) e useAction (enviar ações)
        ├── utils/            # formatação (moeda, data de Brasília) e validação de formulários
        └── test/             # testes de componente e de formatação
```

### Bibliotecas do backend

| Biblioteca | Motivo |
| --- | --- |
| `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`, `express` | Framework da API REST (opção 1 da stack), com módulos, controllers e services em camadas |
| `@nestjs/swagger` | Documentação interativa da API (Swagger/OpenAPI) |
| `prisma`, `@prisma/client` | ORM e migrations do PostgreSQL |
| `zod` | Validação declarativa do corpo e dos query params (tipos estritos, limites e regras que cruzam campos) |
| `decimal.js` | Aritmética decimal exata nos valores em moedas, com arredondamento "meio para longe do zero" |
| `reflect-metadata`, `rxjs` | Dependências obrigatórias do NestJS |
| `jest`, `ts-jest`, `@types/jest` | Testes automatizados |
| `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-config-prettier`, `globals`, `prettier` | Lint e formatação |
| `@nestjs/cli`, `typescript`, `@types/node`, `@types/express` | Build e tipos |

### Bibliotecas do frontend

| Biblioteca | Motivo |
| --- | --- |
| `react`, `react-dom` | Interface (stack obrigatória) |
| `react-router-dom` | Rotas no modo biblioteca (jogadores, clubes, página do clube, partidas, classificação) |
| `vite`, `@vitejs/plugin-react`, `typescript` | Projeto Vite (template React + TypeScript) e build |
| `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/dom`, `@testing-library/user-event`, `@testing-library/jest-dom` | Testes de componente |
| `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `eslint-config-prettier`, `globals`, `prettier` | Lint e formatação |
| `@types/react`, `@types/react-dom` | Tipos |

---

## 6. Diferenciais técnicos

| Diferencial | Como executar |
| --- | --- |
| **Testes do backend** (inclui RN02 a RN05, RN06, RN13, RN15, RN16 e RN20 com os exemplos do enunciado) | `cd backend` e depois `npm test` |
| **Testes do frontend** (componentes e formatação) | `cd frontend` e depois `npm test` |
| **Lint e formatação do backend** | `cd backend`, depois `npm run lint` e `npm run format:check` |
| **Lint e formatação do frontend** | `cd frontend`, depois `npm run lint` e `npm run format:check` |
| **Documentação interativa (Swagger)** | Com a API no ar, abra `http://localhost:3000/api/docs` |
| **Logs de requisição** | A saída do backend mostra uma linha por requisição, com data e hora, método, caminho e status (Logger do NestJS) |
| **Docker Compose (tudo com um comando)** | Na raiz, com as portas 3000, 5173 e 5432 livres: `docker compose --profile app up -d --build`. Interface em `http://localhost:5173` e API em `http://localhost:3000` |
| **Responsividade** | Telas utilizáveis com 375 px de largura; as tabelas rolam dentro do próprio quadro |

---

## 7. Decisões e premissas

- **Valor de mercado na listagem:** `GET /players` busca os jogadores com os filtros simples no banco (posição, condição, clube, idade) e aplica em memória a busca por nome, a faixa de valor de mercado, a ordenação e a paginação. Assim, o valor de mercado é calculado num único lugar (`player-valuation.ts`), e não duplicado em SQL.
- **Ordem alfabética:** os nomes são comparados em minúsculas, sem acentos (NFD sem marcas Mn), ponto de código a ponto de código, com desempate pelo id.
- **Unicidade do nome do clube:** a coluna adicional `clubes.nome_normalizado` (UNIQUE) guarda o nome em minúsculas, depois da regra V4. Isso diferencia acentos ("Águias FC" ≠ "Aguias FC") e ignora maiúsculas.
- **Datas:** o banco guarda instantes em UTC; a API recebe e devolve no horário de Brasília (`-03:00`).
- **Sigla do clube:** as 3 letras precisam aparecer no nome, na ordem, ignorando maiúsculas e acentos, e a primeira precisa ser a primeira letra do nome. Fora disso a resposta é `400`, porque é validação de formato.
- **Fim da fidelidade fora da janela** (no passado ou além de 1.095 dias): `400`, como na tabela de limites.
- **Contrato na venda:** com percentual de multa maior que zero, o contrato vai para `RESCINDIDO`; com 0 dia restante, para `ENCERRADO`.
- **Consistência:** compra, venda, escalação, partida (com os 6 duelos) e alteração de condição que tira um titular rodam cada uma numa transação do banco. Na compra e na venda, as linhas do jogador e do clube são travadas (`SELECT … FOR UPDATE`).
- **Mensagens de erro:** toda recusa passa pelo filtro global `HttpExceptionFilter` e devolve `{ "message": "..." }`, sem stack trace. Corpo que não é JSON válido devolve `400`. Id fora do formato na URL devolve `404`.
- **Endpoint `GET /clubs/{id}`:** cada jogador do elenco traz também o objeto `contract`.
- **Frontend:** a tela impede as combinações que o enunciado permite impedir: "só livres" com clube, `DOENTE` direto para `APTO`, mudança de posição de jogador com clube e idade menor que a atual. As demais recusas são enviadas à API, e a tela mostra o `message`.

---

## 8. Funcionalidades não implementadas

Nenhuma.

---

## 9. Uso de inteligência artificial

- **Ferramenta:** Claude Code (modelo Claude Opus 5.5, da Anthropic), usado no terminal do desenvolvimento.
- **Onde:** em todo o projeto. A IA gerou a estrutura inicial do backend (módulos NestJS, schema Prisma, validação com Zod, cálculos de mercado e da partida) e do frontend (camada de API, componentes reutilizáveis e telas), além dos testes, do Docker Compose e deste README.
- **Como e por quê:** usei a IA como par de programação. Eu passava o enunciado e o barema, e ela propunha a arquitetura e o código de cada módulo. Cada regra foi conferida com as tabelas de exemplo do enunciado, transformadas em testes automatizados (`backend/test`). Também rodei o fluxo completo pela API e pela interface: cadastro, compra, venda, histórico, CSV, escalação, partida e classificação.
- **O que aceitei, alterei ou descartei:** aceitei a divisão em camadas (controller → service → Prisma) e as funções puras de cálculo. Revisei e ajustei mensagens, nomes e a validação de formulários. Descartei a ideia inicial de calcular o valor de mercado em SQL, para não duplicar a fórmula.
