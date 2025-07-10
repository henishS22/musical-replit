FROM node:18

# Set working directory
WORKDIR /app

# Update and install required dependencies for Playwright
RUN apt-get update && apt-get install -y \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libxdamage1 \
    libxrandr2 \
    libxfixes3 \
    libasound2 \
    libpango-1.0-0 \
    libcairo2 \
    fonts-noto \
    fonts-noto-cjk \
    fonts-noto-color-emoji \
    libxcomposite1 \
    libx11-6 \
    libxcursor1 \
    libxss1 \
    libxtst6 \
    libglib2.0-0 \
    libgtk-3-0 \
    libstdc++6 \
    wget \
    ca-certificates \
    chromium && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Playwright and its dependencies
RUN npm install -D @playwright/test && npx playwright install --with-deps

# Copy package.json and lock files
COPY package*.json ./

# Install node modules
RUN npm install --force

# Copy project files
COPY . .

# Set environment variables for Playwright
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=0

# Accept an environment file as a build argument
ARG ENV_FILE
COPY ${ENV_FILE} .env.development

# Default ENV
ARG ENV=development

# Build app
RUN npm run build:$ENV

# Expose port
EXPOSE 3001

# Start app
CMD ["npm", "run", "start:development"]
