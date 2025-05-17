# Nest Boilerplate Main API

Este projeto é a API principal para o sistema **Nest Boilerplate**, desenvolvida utilizando **NestJS**. A API fornece serviços para gerenciar integrações com banco de dados, autenticação, cache e mais, garantindo alta performance e escalabilidade.

---

## **Índice**

- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Configuração e Instalação](#configuração-e-instalação)
- [Comandos Disponíveis](#comandos-disponíveis)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Docker](#docker)
- [Conventional Commits](#conventional-commits)
- [Contribuição](#contribuição)

---

## **Tecnologias Utilizadas**

- [Node.js](https://nodejs.org/)
- [NestJS](https://nestjs.com/)
- [Prisma](https://www.prisma.io/)
- [MySQL](https://www.mysql.com/)
- [Redis](https://redis.io/)
- [Docker](https://www.docker.com/)
- [Nodemon](https://nodemon.io/)

---

## **Estrutura do Projeto**

```plaintext
src/
├── app.module.ts      # Módulo raiz
├── main.ts            # Ponto de entrada da aplicação
├── prisma/            # Integração com o Prisma
├── shared/            # Módulos e utilitários compartilhados
├── modules/           # Módulos organizados por funcionalidade
└── scripts/           # Scripts de inicialização e suporte
```

---

## **Configuração e Instalação**

### **Pré-requisitos**
Certifique-se de ter instalado:
- [Node.js](https://nodejs.org/) (v21+ recomendado)
- [Yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/)

### **Passos para Instalação**

1. Clone o repositório:
   ```bash
   git clone https://github.com/usuario/nest_boilerplate_main_api.git
   cd nest_boilerplate_main_api
   ```

2. Instale as dependências:
   ```bash
   yarn install
   ```

3. Configure o ambiente:
   - Copie o arquivo `.env.example` para `.env`:
     ```bash
     cp .env.example .env
     ```
   - Atualize as variáveis de ambiente conforme necessário.

4. Gere o cliente Prisma:
   ```bash
   npx prisma generate
   ```

---

## **Comandos Disponíveis**

### **Iniciar o Servidor**
- Ambiente de desenvolvimento com hot reload:
  ```bash
  yarn start:dev
  ```
- Ambiente de produção:
  ```bash
  yarn start:prod
  ```

### **Executar Testes**
- Testes unitários:
  ```bash
  yarn test
  ```
- Testes de cobertura:
  ```bash
  yarn test:cov
  ```

### **Lint e Formatação**
- Verificar lint:
  ```bash
  yarn lint
  ```
- Corrigir problemas de lint:
  ```bash
  yarn lint:fix
  ```
- Formatar código:
  ```bash
  yarn format
  ```

---

## **Variáveis de Ambiente**

As principais variáveis de ambiente estão listadas no arquivo `.env.example`. Algumas delas incluem:

| Variável            | Descrição                          | Padrão                |
|---------------------|------------------------------------|-----------------------|
| `APP_PORT`          | Porta da aplicação                | `3001`                |
| `NODE_ENV`          | Ambiente (development/production) | `development`         |
| `DB_HOST`           | Host do banco de dados MySQL      | `localhost`           |
| `DB_PORT`           | Porta do banco de dados MySQL     | `3306`                |
| `DB_USER`           | Usuário do banco de dados         | `root`                |
| `DB_PASSWORD`       | Senha do banco de dados           | `password`            |
| `DB_NAME`           | Nome do banco de dados            | `nest_boilerplate`           |
| `REDIS_HOST`        | Host do Redis                     | `localhost`           |
| `REDIS_PORT`        | Porta do Redis                    | `6379`                |

---

## **Docker**

Este projeto usa **Docker** para facilitar o desenvolvimento e o deploy.

### **Subir o Ambiente com Docker Compose**
Certifique-se de que o Docker está instalado e rodando. Execute:

```bash
docker-compose up --build -d
```

### **Serviços no Docker Compose**

| Serviço             | Descrição                          |
|---------------------|------------------------------------|
| `nest_boilerplate_api`     | API principal                     |
| `nest_boilerplate_mysql`   | Banco de dados MySQL              |
| `nest_boilerplate_redis`   | Servidor Redis                    |

### **Parar o Ambiente**

```bash
docker-compose down
```

---

## **Conventional Commits**

Para manter o histórico de commits organizado, utilize o padrão de [Conventional Commits](https://www.conventionalcommits.org/). Alguns exemplos:

- **Adicionando uma funcionalidade:**
  ```bash
  feat(module): adiciona endpoint para gerenciamento de produtos
  ```
- **Corrigindo um bug:**
  ```bash
  fix(module): corrige erro na autenticação de usuários
  ```
- **Alterando configurações:**
  ```bash
  chore(module): atualiza dependências no package.json
  ```

### **Checklist para Commits**
1. Certifique-se de que sua branch está atualizada:
   ```bash
   git pull origin develop
   ```
2. Adicione suas alterações:
   ```bash
   git add .
   ```
3. Faça o commit com uma mensagem clara e seguindo o padrão:
   ```bash
   git commit -m "<tipo>(<module>): <mensagem>"
   ```
4. Suba sua branch:
   ```bash
   git push origin feature/<descricao>
   ```

---

## **Contribuição**

Contribuições são bem-vindas! Para contribuir:
1. Faça um fork do projeto.
2. Crie uma branch para sua feature:
   ```bash
   git checkout -b feature/nova-feature
   ```
3. Faça o commit das suas alterações seguindo o padrão de Conventional Commits.
4. Envie um pull request para revisão.

---

## **Contato**

Em caso de dúvidas ou sugestões, entre em contato pelo [email@example.com](mailto:email@example.com).
