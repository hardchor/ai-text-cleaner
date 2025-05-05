# Use official Python runtime
FROM python:3.12-slim

# Install uv CLI for dependency management
RUN pip install uv

# Set working directory
WORKDIR /app

# Copy over dependency definitions
COPY pyproject.toml uv.lock ./

# Install dependencies via uv
RUN uv sync

# Copy application code
COPY . .

# Expose Streamlit port
EXPOSE 8501

# Launch Streamlit app via uv
CMD ["uv", "run", "streamlit", "run", "streamlit_app.py", "--server.port", "8501", "--server.address", "0.0.0.0"]
