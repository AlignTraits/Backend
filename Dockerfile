# Use Node.js LTS image as base
FROM node:18-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Copy the Prisma schema file
COPY prisma ./prisma

# set environment variables
ENV DATABASE_URL="postgresql://postgres.deenbfluqqapjuhrzrlu:igBm4ePjLb3rZbqU@aws-0-eu-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
ENV DIRECT_URL="postgresql://postgres.deenbfluqqapjuhrzrlu:igBm4ePjLb3rZbqU@aws-0-eu-west-2.pooler.supabase.com:5432/postgres"

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
