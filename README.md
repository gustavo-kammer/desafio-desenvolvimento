# Sistema de Estoque e Produtos

Desafio técnico da Torrecid: aplicação para gerenciamento de estoque e produtos, desenvolvida com **ASP.NET Core (.NET 10)**, **PostgreSQL**, **JWT** e **Angular 21**.

## Back-end

### Pré-requisitos

- [.NET SDK 10](https://dotnet.microsoft.com/download)
- [Docker](https://www.docker.com/) para executar o PostgreSQL

### Como executar

Na raiz do repositório:

1. Crie o arquivo de configuração:

   ```bash
   cp .env.example .env
   ```

   No PowerShell, utilize:

   ```powershell
   Copy-Item .env.example .env
   ```

2. Inicie o banco de dados:

   ```bash
   docker compose up -d
   ```

3. Execute a API:

   ```bash
   dotnet run --project Backend/Estoque.API
   ```

   As migrations e a criação do administrador inicial são executadas automaticamente.

A API estará disponível em [http://localhost:5046](http://localhost:5046).

### Swagger

Acesse a [documentação interativa da API](http://localhost:5046/swagger). A rota `/` também redireciona para o Swagger.

Para testar os endpoints protegidos:

1. Execute `POST /api/auth/login` utilizando as credenciais válidas.
2. Copie o valor de `accessToken` retornado pela API.
3. Clique em **Authorize** no Swagger e informe o token conforme o esquema de autenticação configurado.

### Credenciais iniciais

- **E-mail:** `admin@estoque.com`
- **Senha:** `Admin@12345`

As credenciais podem ser configuradas pelo arquivo `.env`.

### Testes

Execute os testes automatizados do back-end:

```bash
dotnet test Backend/Backend.slnx
```

## Front-end

### Pré-requisitos

- [Node.js 22 ou superior](https://nodejs.org/) e npm
- API e banco de dados em execução

### Como executar

A partir da raiz do repositório, execute:

```bash
cd Frontend
npm install
npm start
```

Acesse [http://localhost:4200](http://localhost:4200) e entre com as credenciais iniciais informadas na seção do back-end.

A URL da API pode ser configurada nos arquivos de ambiente em `Frontend/src/environments/`.

### Testes

Execute os testes automatizados do front-end:

```bash
npm test
```
