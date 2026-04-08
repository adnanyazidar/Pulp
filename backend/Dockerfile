FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Expose the port Render assigns
EXPOSE 10000

# Start the server
CMD ["bun", "run", "src/index.ts"]
