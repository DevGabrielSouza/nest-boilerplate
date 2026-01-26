FROM node:22-alpine

WORKDIR /usr/src/nest

RUN npm i -g @nestjs/cli

COPY package*.json ./
RUN yarn install

COPY . .

RUN npx prisma generate

RUN chmod +x scripts/*.sh

EXPOSE 3001

ENTRYPOINT ["scripts/wait-for-it.sh", "nest_boilerplate_mysql", "3306", "--"]
CMD ["scripts/start-dev.sh"]
