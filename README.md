# Sistema de Estoque e Produtos

Desafio técnico do processo seletivo da Torrecid: API de gestão de produtos e estoque em **C# / .NET 10**, com autenticação JWT, perfis de acesso e auditoria completa das movimentações. Como diferencial, inclui um front-end em **Angular 21** que consome a API.

## Sumário

- [Funcionalidades](#funcionalidades)
- [Stack](#stack)
- [Como executar](#como-executar)
- [Perfis e permissões](#perfis-e-permissões)
- [Endpoints](#endpoints)
- [Regras de negócio](#regras-de-negócio)
- [Arquitetura e padrões](#arquitetura-e-padrões)
- [Tratamento de erros](#tratamento-de-erros)
- [Testes](#testes)
- [Front-end](#front-end)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Decisões técnicas](#decisões-técnicas)

## Funcionalidades

- **Produtos:** cadastro, edição, listagem paginada com busca/filtros e arquivamento (exclusão lógica). Cada produto tem categoria, unidade de medida e estoque mínimo, com indicação de estoque abaixo do mínimo.
- **Categorias:** listagem e cadastro/edição.
- **Estoque:** entrada, saída, reserva, cancelamento de reserva, consumo de reserva e ajuste manual (aumento/redução), cada um registrado no histórico.
- **Histórico de movimentações:** quem fez, quando, saldo antes/depois (total e reservado), motivo, justificativa e documento de referência, com filtros por produto, usuário, tipo e período.
- **Usuários:** CRUD, ativação/desativação e redefinição de senha.
- **Autenticação e autorização:** login com JWT e três perfis (Administrador, Operador, Consultor).
- **Auditoria:** todo movimento grava o usuário responsável, extraído do token.

## Stack

| Camada | Tecnologias |
|---|---|
| API | .NET 10, ASP.NET Core (controllers), EF Core 10, Npgsql |
| Banco | PostgreSQL 17 (Docker Compose) |
| Segurança | JWT (HS256), BCrypt, policies de autorização |
| Testes | xUnit |
| Front-end | Angular 21, TypeScript, Tailwind CSS 4, RxJS, signals |

## Como executar

### Pré-requisitos

- [.NET SDK 10](https://dotnet.microsoft.com/download)
- [Docker](https://www.docker.com/) (para o PostgreSQL)
- [Node.js 22+](https://nodejs.org/) e npm (apenas para o front-end)

### 1. Configuração

Na raiz do repositório, crie o `.env` a partir do exemplo:

```bash
cp .env.example .env        # no Windows (PowerShell): Copy-Item .env.example .env
```

Variáveis principais (todas têm valor de desenvolvimento no `.env.example`):

| Variável | Descrição |
|---|---|
| `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_PORT` | Banco criado pelo Docker Compose |
| `ConnectionStrings__Default` | String de conexão usada pela API |
| `Jwt__Secret` | Chave de assinatura do JWT (mínimo 32 caracteres) |
| `Jwt__ExpirationMinutes` | Validade do token |
| `SeedAdmin__Email` / `SeedAdmin__Password` | Administrador criado na primeira execução |
| `Cors__Origins__0`, `Cors__Origins__1` | Origens permitidas (front-end) |

> O `.env` está no `.gitignore`. Em produção, troque `Jwt__Secret` e a senha do administrador.

### 2. Banco de dados

```bash
docker compose up -d
```

### 3. API

```bash
dotnet run --project Backend/Estoque.API
```

Na inicialização a API **aplica as migrations automaticamente** e cria o administrador inicial (somente se ainda não houver usuários).

- API: `http://localhost:5046`
- Swagger: `http://localhost:5046/swagger` (a raiz `/` redireciona para ele)

Para testar no Swagger, faça `POST /api/auth/login` e use o `accessToken` no botão **Authorize**.

**Usuário inicial:** `admin@estoque.com` / `Admin@12345` (configurável no `.env`).

### 4. Front-end (opcional)

```bash
cd Frontend
npm install
npm start
```

Acesse `http://localhost:4200`. A URL da API fica em `Frontend/src/environments/`.

### 5. Testes

```bash
dotnet test Backend/Backend.slnx
```

### Migrations

As migrations ficam em `Backend/Estoque.Infra/Data/Migrations`. Para criar uma nova:

```bash
dotnet ef migrations add NomeDaMigration \
  --project Backend/Estoque.Infra --startup-project Backend/Estoque.API \
  --output-dir Data/Migrations
```

## Perfis e permissões

| Ação | Administrador | Operador | Consultor |
|---|:---:|:---:|:---:|
| Consultar produtos, categorias, estoque, reservas e histórico | ✅ | ✅ | ✅ |
| Entrada, saída e reservas (criar, cancelar, consumir) | ✅ | ✅ | ❌ |
| Ajuste manual de estoque | ✅ | ❌ | ❌ |
| Gerenciar produtos e categorias | ✅ | ❌ | ❌ |
| Gerenciar usuários | ✅ | ❌ | ❌ |

Implementado com *policies* (`ManageUsers`, `ManageProducts`, `OperateStock`, `AdjustStock`) declaradas em `Estoque.API/Security/Policies.cs`.

## Endpoints

Todos os endpoints, exceto o login, exigem `Authorization: Bearer <token>`. A documentação interativa completa está no Swagger.

**Autenticação**

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth/login` | Autentica e devolve o JWT |
| GET | `/api/auth/me` | Dados do usuário autenticado |

**Produtos e categorias**

| Método | Rota | Perfil |
|---|---|---|
| GET | `/api/products` (`search`, `categoryId`, `onlyBelowMinimumStock`, `page`, `pageSize`) | Todos |
| GET | `/api/products/{id}` | Todos |
| POST / PUT | `/api/products`, `/api/products/{id}` | Administrador |
| DELETE | `/api/products/{id}` (arquiva) | Administrador |
| GET | `/api/categories` | Todos |
| POST / PUT | `/api/categories`, `/api/categories/{id}` | Administrador |

**Estoque**

| Método | Rota | Perfil |
|---|---|---|
| POST | `/api/stock/entries` | Administrador, Operador |
| POST | `/api/stock/exits` | Administrador, Operador |
| POST | `/api/stock/adjustments/increase` | Administrador |
| POST | `/api/stock/adjustments/decrease` | Administrador |
| GET | `/api/stock/movements` (`productId`, `userId`, `type`, `from`, `to`, `page`, `pageSize`) | Todos |

**Reservas**

| Método | Rota | Perfil |
|---|---|---|
| GET | `/api/reservations` (`status`, `productId`) | Todos |
| POST | `/api/reservations` | Administrador, Operador |
| POST | `/api/reservations/{id}/cancel` | Administrador, Operador |
| POST | `/api/reservations/{id}/consume` | Administrador, Operador |

**Usuários** (somente Administrador)

| Método | Rota |
|---|---|
| GET / POST | `/api/users` |
| GET / PUT | `/api/users/{id}` |
| PUT | `/api/users/{id}/password` |
| POST | `/api/users/{id}/activate`, `/api/users/{id}/deactivate` |

Enums trafegam como *strings* em camelCase (ex.: `"administrator"`, `"reservationCancellation"`, `"adjustmentIn"`). Listagens paginadas retornam `{ items, page, pageSize, totalCount, totalPages }`.

## Regras de negócio

- **Saldo disponível** = quantidade total − quantidade reservada. Saídas e novas reservas são limitadas ao disponível.
- **Reserva** separa quantidade sem baixar o total. **Cancelar** devolve ao disponível; **consumir** baixa do total e do reservado.
- Produtos em **unidade** só aceitam quantidades inteiras; toda quantidade deve ser maior que zero.
- **Ajuste manual** exige motivo e justificativa.
- **Arquivamento** de produto é bloqueado se houver saldo em estoque ou reservas ativas; produto arquivado não pode ser editado.
- **Concorrência otimista** no saldo (coluna de sistema `xmin` do PostgreSQL) evita que duas operações simultâneas corrompam o estoque.
- Toda movimentação grava o saldo antes/depois e o usuário responsável (auditoria imutável).
- Usuário desativado não consegue autenticar.

## Arquitetura e padrões

Clean Architecture em camadas, com dependências apontando para dentro:

```
API  →  Application  →  Domain
 └────→  Infra  ──────────↗
```

- **Domain:** entidades com regras de negócio encapsuladas (`Stock`, `Product`, `Reservation`, `StockMovement`), exceções de domínio e contratos de repositório.
- **Application:** serviços de caso de uso, DTOs e contratos (`ICurrentUser`, `IPasswordHasher`, `ITokenService`). Organizada **por funcionalidade** (Products, Movements, Reservations, Users, Auth).
- **Infra:** EF Core, repositórios, `UnitOfWork`, migrations, BCrypt, JWT e seed.
- **API:** controllers finos, policies, tratamento global de erros e Swagger.

Padrões aplicados:

- **Strategy** para os tipos de movimentação (`EntryStrategy`, `ExitStrategy`, `AdjustmentInStrategy`, `AdjustmentOutStrategy`), resolvidas por `MovementStrategyResolver`; novos tipos entram sem alterar o serviço (Open/Closed).
- **Repository + Unit of Work** para isolar a persistência e garantir transações atômicas.
- **Injeção de dependência** em todas as camadas (Dependency Inversion).
- **DTOs imutáveis** (`record`) com fábrica estática `From`, sem expor entidades.
- **Encapsulamento de domínio:** setters privados e operações como `Reserve`, `ConsumeReservation` e `Archive` protegem os invariantes.

SOLID: responsabilidade única por serviço/estratégia, abertura para extensão via Strategy, dependência de abstrações e contratos segregados por funcionalidade.

## Tratamento de erros

Um *exception handler* global converte exceções em `ProblemDetails` (RFC 9457) com mensagens em português, `errorCode` estável e `traceId`:

```json
{
  "status": 422,
  "title": "Regra de negócio violada",
  "detail": "Estoque insuficiente. Solicitado: 500, disponível: 150.",
  "errorCode": "insufficient_stock",
  "traceId": "00-..."
}
```

Erros de validação retornam o mapa `errors` por campo.

## Testes

Testes unitários com xUnit nos pontos de maior risco: autenticação, usuários, produtos (inclusive arquivamento), reservas e a estratégia de entrada de estoque.

```bash
dotnet test Backend/Backend.slnx
```

## Front-end

SPA em Angular 21 com identidade visual inspirada na Torrecid (verde `#009579` e preto), contendo: login, produtos, movimentações (registro e histórico), reservas, categorias e usuários.

- Componentes *standalone*, **signals**, `OnPush`, formulários reativos e rotas *lazy*.
- Interceptor que injeta o JWT, *guards* de autenticação e de perfil; o menu e as ações se adaptam ao perfil logado.
- Componentes compartilhados: botão, badge, modal, diálogo de confirmação, paginação e *toasts*.
- Convenções: modificadores de acesso e tipos de retorno explícitos, interfaces com prefixo `I`.

## Estrutura do repositório

```
.
├── Backend/
│   ├── Estoque.API/            # controllers, policies, Program.cs
│   ├── Estoque.Application/    # serviços, DTOs, estratégias
│   ├── Estoque.Domain/         # entidades, regras, contratos
│   ├── Estoque.Infra/          # EF Core, repositórios, migrations, segurança
│   └── Estoque.Tests/          # testes unitários
├── Frontend/                   # Angular 21
├── docker-compose.yml          # PostgreSQL 17
└── .env.example
```

## Decisões técnicas

- **Reserva como saldo separado**, e não como movimentação que altera o total: mantém o estoque físico fiel e permite saber o disponível a qualquer momento.
- **Exclusão lógica de produtos** para preservar o histórico de movimentações e reservas.
- **Controle de concorrência otimista** em vez de bloqueios pessimistas: simples e suficiente para o cenário.
- **Organização por funcionalidade** na camada Application: facilita localizar e evoluir cada módulo.
- **Migrations aplicadas na inicialização:** reduz o atrito de avaliação (basta subir o banco e executar a API).
