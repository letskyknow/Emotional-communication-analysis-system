FROM node:18-alpine

WORKDIR /app

# Install PostgreSQL client for database checks
RUN apk add --no-cache postgresql-client

# Install dependencies
COPY package.json ./
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Copy init script and make it executable
COPY init-db.sh /app/
RUN chmod +x /app/init-db.sh

# Expose port
EXPOSE 3000

# Start the application with initialization
CMD ["sh", "-c", "/app/init-db.sh && node dist/main"]