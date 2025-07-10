# Use the official Node.js image as the base images
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy only the package.json and package-lock.json to the container
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the entire project to the container
COPY . .

# Set the environment to production for optimized builds
ENV NODE_ENV=production

# Copy the environment file into the container
ARG ENV_FILE
COPY ${ENV_FILE} .env

# Build the application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Command to serve the built application
CMD ["npm", "run", "start"]
