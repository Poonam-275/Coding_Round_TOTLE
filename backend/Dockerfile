FROM node:20-alpine
WORKDIR /app
RUN npm i -g @nestjs/cli
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm ci || npm install
COPY . .
RUN npx prisma generate || true
EXPOSE 3000
CMD ["npm", "run", "start:dev"]
