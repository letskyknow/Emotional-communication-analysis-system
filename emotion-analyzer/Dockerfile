FROM python:3.11

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download the model during build
RUN python -c "from transformers import pipeline; pipeline('sentiment-analysis', model='uer/chinese_roberta_L-12_H-768')"

COPY . .

CMD ["python", "analyzer.py"]