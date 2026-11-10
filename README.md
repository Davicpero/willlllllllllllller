# Como subir o sistema

## O que precisa ter instalado no computador

| Programa | Versão | Para quê |
|---|---|---|
| [Node.js](https://nodejs.org) | 18 ou mais nova (recomendado 22 LTS) | roda o servidor |
| [PostgreSQL](https://www.postgresql.org/download/) + pgAdmin | 14 ou mais nova | banco de dados |
| VS Code | qualquer | editar o código |

Para conferir se o Node está instalado, abra o terminal e rode:

```bash
node -v
npm -v
```

## Dependências do projeto

Já estão no `package.json`. O `npm install` baixa todas de uma vez.

| Pacote | Para quê |
|---|---|
| `express` | servidor e rotas |
| `pg` | conexão com o PostgreSQL |
| `bcryptjs` | criptografa a senha do usuário |
| `jsonwebtoken` | gera o token de login (JWT) |
| `cookie-parser` | lê o cookie com o token |
| `cors` | libera requisições de outras origens |
| `dotenv` | lê o arquivo `.env` (opcional) |
| `nodemon` | reinicia o servidor sozinho quando salva um arquivo |

Se o `package.json` se perder, dá para instalar tudo na mão:

```bash
npm install express pg bcryptjs jsonwebtoken cookie-parser cors dotenv nodemon
```

> O `package.json` precisa ter `"type": "module"` e o script `"dev": "nodemon src/server.js"`.

## Passo a passo

### 1. Criar o banco

1. Abra o **pgAdmin** e conecte no servidor.
2. Clique com o botão direito em **Databases → Create → Database**.
3. Dê o nome que está no `db.js` (campo `database`) e salve.
4. Clique com o botão direito no banco criado → **Query Tool**.
5. Abra o arquivo `sql.sql`, cole tudo e execute (**F5**).

### 2. Conferir a conexão

No `db.js`, confira se usuário, senha, porta e nome do banco batem com o seu PostgreSQL. O padrão é:

| Campo | Valor |
|---|---|
| user | `postgres` |
| host | `localhost` |
| database | nome do banco criado no passo 1 |
| password | `senai` |
| port | `5432` |

Opcional: em vez de mudar o `db.js`, crie um arquivo `.env` na raiz do projeto:

```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=nome_do_banco
DB_PASSWORD=sua_senha
DB_PORT=5432
```

### 3. Instalar e rodar

No terminal, **dentro da pasta do projeto** (a que tem o `package.json`):

```bash
npm install
npm run dev
```

Deve aparecer `Servidor rodando na porta 3000`.

### 4. Usar

1. Abra **http://localhost:3000** no navegador.
2. Clique em **Criar conta**, cadastre um usuário e faça login.
3. Cadastre as três entidades primeiro e depois faça os vínculos (o vínculo precisa que elas já existam).

## Problemas comuns

| Erro | Solução |
|---|---|
| `'npm' não é reconhecido` | Node não está instalado ou o terminal foi aberto antes da instalação. Instale e reabra o VS Code. |
| `Cannot find package 'express'` (ou outro) | Faltou o `npm install` na pasta certa. |
| `password authentication failed` | Senha errada no `db.js` ou no `.env`. |
| `database "..." does not exist` | O nome do banco no pgAdmin é diferente do `db.js`. |
| `relation "..." does not exist` | Faltou rodar o `sql.sql` dentro do banco certo. |
| `EADDRINUSE: address already in use :::3000` | Já tem um servidor rodando. Feche o outro terminal (**Ctrl+C**) ou troque a porta no `server.js`. |
| Volta sempre para a tela de login | O token expirou (1 hora) ou o servidor foi reiniciado com outra chave. Faça login de novo. |
| Erro ao excluir um registro | Ele está sendo usado em um vínculo. Exclua o vínculo primeiro. |
