"""
Fraud Detection ML Component - Flask API

This module implements a Flask API for fraud detection.
It exposes an HTTP endpoint to receive transaction data and return a fraud score.
"""

import logging
from flask import Flask, request, jsonify

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

@app.route('/score', methods=['POST'])
def score():
    data = request.get_json()

    # Validate input fields
    if not data or 'id' not in data or 'amount' not in data or 'timestamp' not in data:
        logger.warning(f"Invalid request data: {data}")
        return jsonify({'error': 'Missing required transaction fields.'}), 400

    # Simple fraud scoring logic:
    # For demonstration, we use the transaction amount to determine a fraud score.
    # Example: If amount is high, score is closer to 1; otherwise, lower.
    amount = data.get('amount', 0)
    fraud_score = min(1.0, amount / 1000.0)  # Adjust the divisor to tune the scoring logic

    logger.info(f"Fraud score for transaction {data.get('id')}: {fraud_score:.2f}")
    return jsonify({'fraudScore': fraud_score}), 200

@app.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint.
    
    Returns a 200 OK response if the service is running.
    """
    return jsonify({'status': 'healthy'}), 200

if __name__ == '__main__':
    logger.info("Starting Fraud Detection ML API on port 5000")
    # Run the Flask app on port 5000 and bind to all interfaces
    app.run(host='0.0.0.0', port=5000)
