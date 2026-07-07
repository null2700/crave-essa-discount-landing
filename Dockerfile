FROM node:18-alpine

WORKDIR /app

# Install production dependencies only (speed)
COPY package.json package-lock.json* ./
RUN npm ci --only=production || npm install --production

# Copy app source
COPY . .

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "server.js"]
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install --production

# Copy app files
COPY . ./

EXPOSE 3000

ENV PORT=3000

CMD ["npm", "start"]
