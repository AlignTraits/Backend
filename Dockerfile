FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN apk add --no-cache openssl
RUN npm install

COPY prisma ./prisma
COPY . .

RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "start"]