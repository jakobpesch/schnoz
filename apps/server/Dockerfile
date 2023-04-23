# Use Node.js v14 as base image
FROM node:19

# Create app directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Install app dependencies
COPY package.json ./
COPY pnpm-lock.yaml ./
RUN pnpm install

# Copy app source code
COPY . .

# Generate prisma file
RUN npx prisma generate

# Expose the port the app runs on
EXPOSE 3000

# Start the app
CMD ["pnpm", "start"]