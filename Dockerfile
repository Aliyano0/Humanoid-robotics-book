FROM python:3.12-slim

WORKDIR /app

# Install system dependencies if needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Make the startup script executable
RUN chmod +x start_server.sh

# Expose port (Hugging Face will set the PORT environment variable)
EXPOSE 7860

# Use the startup script to handle the PORT environment variable
CMD ["./start_server.sh"]