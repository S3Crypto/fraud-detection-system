"""
Fraud Detection ML Model

This module implements a machine learning model for fraud detection
in financial transactions.
"""

import os
import json
import logging
import numpy as np
from typing import Dict, Any, Union, List
from kafka import KafkaConsumer, KafkaProducer
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class FraudDetectionModel:
    """
    Machine learning model for fraud detection.
    This is a placeholder implementation that will be replaced with
    an actual ML model in the future.
    """
    
    def __init__(self):
        """Initialize the fraud detection model."""
        logger.info("Initializing fraud detection model")
        # In a real implementation, this would load a trained model
        self.feature_names = [
            'transaction_amount', 
            'merchant_category', 
            'time_since_last_transaction',
            'distance_from_last_transaction',
            'is_foreign_transaction'
        ]
    
    def preprocess(self, transaction: Dict[str, Any]) -> np.ndarray:
        """
        Preprocess a transaction for model input.
        
        Args:
            transaction: Dictionary containing transaction data
            
        Returns:
            Numpy array of preprocessed features
        """
        # Extract features from transaction
        # This is a simplified example
        features = np.array([
            transaction.get('amount', 0),
            hash(transaction.get('merchant_category', '')) % 100,  # Simple category encoding
            transaction.get('time_since_last_transaction', 0),
            transaction.get('distance_from_last_transaction', 0),
            1 if transaction.get('is_foreign', False) else 0
        ])
        
        return features.reshape(1, -1)
    
    def predict(self, transaction: Dict[str, Any]) -> float:
        """
        Predict fraud probability for a transaction.
        
        Args:
            transaction: Dictionary containing transaction data
            
        Returns:
            Fraud score (0-100, higher means more likely fraud)
        """
        # Preprocess transaction
        features = self.preprocess(transaction)
        
        # In a real implementation, this would use the model to predict
        # For now, we'll use a simple heuristic
        
        # Suspicious patterns (for demonstration):
        # - High amount transactions
        # - Foreign transactions
        # - Unusual merchant categories
        
        amount = transaction.get('amount', 0)
        is_foreign = transaction.get('is_foreign', False)
        
        # Simple fraud scoring logic
        base_score = 10  # Base fraud probability
        
        # Add score for high amounts
        if amount > 1000:
            base_score += 30
        elif amount > 500:
            base_score += 15
            
        # Add score for foreign transactions
        if is_foreign:
            base_score += 20
            
        # Add some randomness to simulate model uncertainty
        final_score = min(100, max(0, base_score + np.random.normal(0, 10)))
        
        logger.info(f"Fraud score for transaction {transaction.get('id')}: {final_score:.2f}")
        return final_score


def start_kafka_consumer():
    """Start Kafka consumer to process transactions."""
    kafka_brokers = os.getenv('KAFKA_BROKERS', 'localhost:9092')
    
    # Initialize model
    model = FraudDetectionModel()
    
    # Initialize Kafka consumer
    consumer = KafkaConsumer(
        'transactions',
        bootstrap_servers=kafka_brokers.split(','),
        group_id='ml-fraud-detection',
        value_deserializer=lambda m: json.loads(m.decode('utf-8'))
    )
    
    # Initialize Kafka producer for results
    producer = KafkaProducer(
        bootstrap_servers=kafka_brokers.split(','),
        value_serializer=lambda m: json.dumps(m).encode('utf-8')
    )
    
    logger.info("Starting Kafka consumer for transactions")
    
    # Process messages
    for message in consumer:
        transaction = message.value
        
        try:
            # Generate fraud score
            fraud_score = model.predict(transaction)
            
            # Add fraud score to transaction
            transaction['fraud_score'] = float(fraud_score)
            
            # Send scored transaction to results topic
            producer.send('scored-transactions', transaction)
            
            logger.info(f"Processed transaction {transaction.get('id')}")
            
        except Exception as e:
            logger.error(f"Error processing transaction: {str(e)}")


if __name__ == "__main__":
    try:
        start_kafka_consumer()
    except KeyboardInterrupt:
        logger.info("Shutting down ML service")
