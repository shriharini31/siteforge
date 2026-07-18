FROM node:22-slim

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install exactly the production dependency set.
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . ./

# Expose port
EXPOSE 4000

# Use production environment
ENV NODE_ENV=production

# Entrypoint — run the top-level server.js
CMD ["node", "server.js"]
