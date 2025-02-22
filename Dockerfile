# Use Node.js as base image
FROM node:22-alpine AS development

# Set working directory
WORKDIR /usr/src/app

RUN mkdir ./apps
RUN mkdir ./apps/web
RUN mkdir ./apps/server

# Copy package.json and package-lock.json
COPY ./package*.json .

COPY ./apps/web/package*.json ./apps/web
COPY ./apps/server/package*.json ./apps/server

RUN CI=TRUE

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Expose the port that the applications will run on
EXPOSE 5000
EXPOSE 3000

# Command to run the monorepo application in development mode
CMD ["npm", "run", "start:dev"]