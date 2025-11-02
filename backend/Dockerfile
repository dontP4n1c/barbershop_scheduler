FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund
COPY . .
RUN mkdir -p /app/data
RUN npx prisma generate || true
EXPOSE 3001
CMD ["npm", "run", "start"]
