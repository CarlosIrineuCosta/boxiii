# Builder Backend Dockerfile
# Using Ubuntu base to avoid Docker Hub connectivity issues
FROM mcr.microsoft.com/devcontainers/base:ubuntu

WORKDIR /app

# Install Python and pip
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Create symlink for python command
RUN ln -s /usr/bin/python3 /usr/bin/python

COPY backend/requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

COPY backend/ .

EXPOSE 5000

CMD ["uvicorn", "api_server:app", "--host", "0.0.0.0", "--port", "5000"]
