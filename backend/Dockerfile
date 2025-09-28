FROM python:3.12-slim-bookworm

# Ensure RUN uses a proper shell
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# System deps for GeoDjango + PostGIS client
RUN apt-get update && apt-get install -y --no-install-recommends \
    binutils gdal-bin libgdal-dev libproj-dev \
    gcc build-essential \
    && rm -rf /var/lib/apt/lists/*

# Python env
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install Python deps first (cached)
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# App source
COPY . /app

# Make entrypoint executable (in case host FS strips it)
RUN chmod +x /app/entrypoint.sh

EXPOSE 8000

# Default command
CMD ["/app/entrypoint.sh"]
