
# Documentação de Configuração e Uso das Filas

## Introdução

Este documento descreve como configurar e utilizar as filas no sistema da aplicação **Nest Boilerplate Main API**. Utilizamos o Redis como gerenciador de filas para processar tarefas assíncronas de maneira eficiente.

## Requisitos

- Node.js v20.11.0 ou superior
- Redis instalado e em execução
- Pacotes configurados no arquivo `package.json`:
  - `bull`
  - `bull-board` (para monitoramento opcional)

## Configurando o Redis

1. Instale o Redis:
   - No Linux:
     ```bash
     sudo apt update
     sudo apt install redis-server
     ```
   - No macOS (via Homebrew):
     ```bash
     brew install redis
     ```
   - No Windows:
     Baixe o instalador do [site oficial do Redis](https://redis.io/download).

2. Inicie o Redis:
   ```bash
   redis-server
   ```

3. Verifique se o Redis está funcionando:
   ```bash
   redis-cli ping
   ```
   A resposta deve ser `PONG`.

## Configuração das Filas

1. Configure o módulo Redis:
   O arquivo `redis.module.ts` já está preparado para configurar conexões Redis para o NestJS. Certifique-se de que o Redis está configurado corretamente em um arquivo `.env`:
   ```env
   REDIS_HOST=127.0.0.1
   REDIS_PORT=6379
   REDIS_PASSWORD=
   ```

2. Configure os arquivos relacionados a filas:
   - **`send-email-queue.service.ts`**:
     Define a fila para envio de emails.
   - **`send-email-consumer.service.ts`**:
     Define os consumidores que processam as tarefas da fila.

3. Exemplo de inicialização de fila no `send-email-queue.service.ts`:
   ```typescript
   import { Injectable } from '@nestjs/common';
   import { InjectQueue } from '@nestjs/bull';
   import { Queue } from 'bull';

   @Injectable()
   export class SendEmailQueueService {
     constructor(@InjectQueue('send-email') private readonly emailQueue: Queue) {}

     async addEmailToQueue(emailData: any): Promise<void> {
       await this.emailQueue.add('sendEmail', emailData);
     }
   }
   ```

4. Exemplo de consumidor no `send-email-consumer.service.ts`:
   ```typescript
   import { Processor, Process } from '@nestjs/bull';
   import { Job } from 'bull';

   @Processor('send-email')
   export class SendEmailConsumerService {
     @Process('sendEmail')
     async handleSendEmail(job: Job): Promise<void> {
       console.log(`Processing email:`, job.data);
       // Lógica para envio de email
     }
   }
   ```

## Utilizando as Filas

### Passo a Passo

1. Injete o serviço da fila em seu código:
   ```typescript
   import { SendEmailQueueService } from './send-email-queue.service';

   constructor(private readonly emailQueueService: SendEmailQueueService) {}

   async enviarEmail(emailData: any): Promise<void> {
     await this.emailQueueService.addEmailToQueue(emailData);
   }
   ```

2. Certifique-se de que o consumidor está registrado no módulo apropriado (`send-email.module.ts`).

3. Monitore as filas:
   - Para monitorar as filas, adicione o `bull-board` e configure no NestJS. Exemplo:
     ```typescript
     import { createBullBoard } from 'bull-board';
     import { BullAdapter } from 'bull-board/bullAdapter';
     import { Queue } from 'bull';

     const serverAdapter = new ExpressAdapter();
     createBullBoard({
       queues: [new BullAdapter(emailQueue)],
       serverAdapter,
     });

     serverAdapter.setBasePath('/admin/queues');
     app.use('/admin/queues', serverAdapter.getRouter());
     ```

### Interpretação de Logs

- Logs gerados pelo consumidor:
  ```bash
  Processing email: { to: 'user@example.com', subject: 'Welcome!' }
  ```
- Erros:
  Certifique-se de verificar os logs no console ou em ferramentas de monitoramento configuradas (ex.: Bull Dashboard).

## Dicas de Debug

- Verifique a conexão com o Redis:
  ```bash
  redis-cli monitor
  ```
  Este comando exibe todas as interações com o Redis.

- Certifique-se de que as dependências estão instaladas corretamente:
  ```bash
  npm install
  ```

- Teste as filas executando:
  ```bash
  npm run start:dev
  ```

## Conclusão

Com este guia, você está preparado para configurar e utilizar filas na aplicação **Nest Boilerplate Main API**, aproveitando toda a capacidade de processamento assíncrono do Redis e Bull.
