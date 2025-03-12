# Fraud Detection ML Component

This Python module acts as a machine learning (ML) component for fraud scoring. It exposes an HTTP endpoint using Flask to receive transaction data, apply a fraud scoring algorithm, and return a fraud score.

## Setup

### Prerequisites
- Python 3.8+
- pip (Python package manager)

### Environment Setup

1. Create a Python virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Application

Start the Flask application:
```bash
python app.py
```

The service will be available at http://localhost:5000/score

## API Endpoints

### POST /score
Scores a transaction for fraud probability.

**Request Body:**
```json
{
  "id": "tx123",
  "amount": 500,
  "timestamp": "2023-01-01T00:00:00Z",
  "merchant_category": "electronics",
  "is_foreign": false
}
```

**Required fields:**
- `id`: Transaction identifier
- `amount`: Transaction amount
- `timestamp`: Transaction timestamp

**Optional fields:**
- `merchant_category`: Category of the merchant
- `is_foreign`: Whether the transaction is foreign
- Other fields will be ignored by the scoring algorithm

**Response:**
```json
{
  "fraudScore": 0.45,
  "explanation": "Moderate-risk transaction pattern detected"
}
```

- `fraudScore`: A value between 0 and 1, where higher values indicate higher fraud probability
- `explanation`: Optional explanation for high-risk transactions

### GET /health
Health check endpoint to verify the service is running.

**Response:**
```json
{
  "status": "healthy"
}
```

## Running Tests

Execute the test suite:
```bash
python -m unittest test_app.py
```

## Scoring Logic

The current implementation uses a simple rule-based algorithm that considers:
- Transaction amount (higher amounts increase the score)
- Whether the transaction is foreign (foreign transactions increase the score)
- Merchant category (certain categories may be considered higher risk)

In a production environment, this would be replaced with a more sophisticated machine learning model.
