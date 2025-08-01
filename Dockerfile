# Use Node.js for frontend build
FROM node:18-alpine AS frontend-build

# Set working directory for frontend
WORKDIR /frontend

# Copy package files first for better caching
COPY frontend/package.json frontend/package-lock.json ./

# Install dependencies
RUN npm install --frozen-lockfile --production

# Copy frontend source code in specific order to ensure all files are included
COPY frontend/public/ ./public/
COPY frontend/src/ ./src/
COPY frontend/tsconfig.json frontend/tailwind.config.js frontend/postcss.config.js frontend/components.json ./

# Build arguments for React environment variables
ARG REACT_APP_API_BASE_URL
ARG REACT_APP_SITE_NAME  
ARG REACT_APP_SITE_URL
ARG REACT_APP_AUTH_SALT

# Set environment variables for React build
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL
ENV REACT_APP_SITE_NAME=$REACT_APP_SITE_NAME
ENV REACT_APP_SITE_URL=$REACT_APP_SITE_URL  
ENV REACT_APP_AUTH_SALT=$REACT_APP_AUTH_SALT

# Verify structure and build with environment variables
RUN echo "=== Frontend file structure ===" && \
    ls -la && \
    echo "=== Public directory ===" && \
    ls -la public/ && \
    echo "=== Src directory ===" && \
    ls -la src/ && \
    echo "=== Environment variables ===" && \
    echo "REACT_APP_API_BASE_URL: $REACT_APP_API_BASE_URL" && \
    echo "REACT_APP_SITE_NAME: $REACT_APP_SITE_NAME" && \
    echo "=== Building frontend ===" && \
    npm run build

# Use Python for backend
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./

# Copy built frontend files
COPY --from=frontend-build /frontend/build ./static

# Create non-root user
RUN useradd --create-home --shell /bin/bash app
RUN chown -R app:app /app
USER app

# Expose port (Railway will override this with PORT environment variable)
EXPOSE 8082

# Start command (use PORT environment variable from Railway)
CMD ["sh", "-c", "python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8082}"]