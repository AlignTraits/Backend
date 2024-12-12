# Use Node.js LTS image as base
FROM node:18-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN apk add --no-cache openssl
RUN npm install

# Copy the Prisma schema file
COPY prisma ./prisma

# Copy the rest of the application files
COPY . .

# Set environment variables
ENV DATABASE_URL="postgresql://postgres.deenbfluqqapjuhrzrlu:igBm4ePjLb3rZbqU@aws-0-eu-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
ENV DIRECT_URL="postgresql://postgres.deenbfluqqapjuhrzrlu:igBm4ePjLb3rZbqU@aws-0-eu-west-2.pooler.supabase.com:5432/postgres"

# Run Prisma generate and db push using npx
RUN npx prisma generate
RUN npx prisma db push --schema prisma/schema.prisma --accept-data-loss

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
