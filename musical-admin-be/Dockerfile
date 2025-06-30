# Use Node.js 17 as the base image
FROM node:17

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy all files from the current directory to the working directory
COPY . .

# Install dependencies and compile TypeScript files
RUN npm install --force
RUN npm run build:clean

# List files in the build directory for verification
RUN ls build

# Expose the application on port 3002
EXPOSE 3002

# Set the entry point and command to start the application
ENTRYPOINT ["npm"]
CMD ["start"]