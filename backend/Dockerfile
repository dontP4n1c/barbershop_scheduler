FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund
COPY . .
RUN mkdir -p /app/data
EXPOSE 3001
CMD ["npm", "run", "start"]
