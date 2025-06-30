# Use Node.js 17 as the base image
FROM node:17

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy all files from the current directory to the working directory
COPY . .

# Install dependencies and compile TypeScript files
RUN npm install --force

ARG ENV_FILE
COPY ${ENV_FILE} .env

RUN npm run build  # Changed from build:clean to build

# List files in the build directory for verification
RUN ls build

# Expose the application on port 3000
EXPOSE 3000

# Set the entry point and command to start the application
ENTRYPOINT ["npm"]
CMD ["start"]
