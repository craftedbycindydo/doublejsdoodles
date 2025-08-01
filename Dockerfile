# Use Node.js for frontend build
FROM node:18-alpine AS frontend-build

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./frontend/

# Change to frontend directory and install dependencies
WORKDIR /app/frontend
RUN npm install --production --frozen-lockfile

# Copy all frontend source files
COPY frontend/ ./

# Verify files are in the right place and build
RUN ls -la public/ && npm run build

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
COPY --from=frontend-build /app/frontend/build ./static

# Create non-root user
RUN useradd --create-home --shell /bin/bash app
RUN chown -R app:app /app
USER app

# Expose port (Railway will override this with PORT environment variable)
EXPOSE 8082

# Start command (use PORT environment variable from Railway)
CMD ["sh", "-c", "python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8082}"]