FROM python:3.12-slim

WORKDIR /app

# Install dependencies first (cached unless requirements change)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the app (backend + static frontend)
COPY . .

# Railway provides $PORT; default to 8000 for local runs
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
