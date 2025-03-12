"""
Unit tests for the Fraud Detection ML Component Flask API.

This module contains tests for the Flask API endpoints.
"""

import json
import unittest
from app import app

class MLComponentTestCase(unittest.TestCase):
    """Test cases for the ML Component Flask API."""
    
    def setUp(self):
        """Set up the test client."""
        self.app = app.test_client()
        self.app.testing = True
    
    def test_health_check(self):
        """Test the health check endpoint."""
        response = self.app.get('/health')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['status'], 'healthy')
    
    def test_score_missing_fields(self):
        """Test scoring with missing required fields."""
        # Missing 'timestamp'
        payload = {'id': 'tx1', 'amount': 500}
        response = self.app.post('/score', data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn('error', data)
        
        # Missing 'id'
        payload = {'amount': 500, 'timestamp': '2023-01-01T00:00:00Z'}
        response = self.app.post('/score', data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn('error', data)
        
        # Missing 'amount'
        payload = {'id': 'tx1', 'timestamp': '2023-01-01T00:00:00Z'}
        response = self.app.post('/score', data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn('error', data)
    
    def test_score_valid_transaction(self):
        """Test scoring with valid transaction data."""
        # Valid transaction data
        payload = {
            'id': 'tx1', 
            'amount': 600, 
            'timestamp': '2023-01-01T00:00:00Z',
            'is_foreign': False
        }
        
        response = self.app.post('/score', data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        
        # Check that the response contains a fraud score
        self.assertIn('fraudScore', data)
        
        # Validate the fraud score calculation
        expected_score = min(1.0, 600 / 1000.0)
        self.assertAlmostEqual(data['fraudScore'], expected_score)
    
    def test_score_high_risk_transaction(self):
        """Test scoring with a high-risk transaction."""
        # Valid transaction data with high risk factors
        payload = {
            'id': 'tx2', 
            'amount': 1500, 
            'timestamp': '2023-01-01T00:00:00Z',
            'is_foreign': True
        }
        
        response = self.app.post('/score', data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        
        # Check that the response contains a fraud score
        self.assertIn('fraudScore', data)
        
        # Validate the fraud score calculation
        expected_score = min(1.0, 1500 / 1000.0)
        self.assertAlmostEqual(data['fraudScore'], expected_score)
    
    def test_score_missing_fields_new(self):
        # Missing 'timestamp'
        payload = {'id': 'tx1', 'amount': 500}
        response = self.app.post('/score', data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn('error', data)

    def test_score_valid_transaction_new(self):
        # Valid transaction data
        payload = {'id': 'tx1', 'amount': 600, 'timestamp': '2023-01-01T00:00:00Z'}
        response = self.app.post('/score', data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('fraudScore', data)
        # Optionally, validate the fraud score calculation
        expected_score = min(1.0, 600 / 1000.0)
        self.assertAlmostEqual(data['fraudScore'], expected_score)

if __name__ == '__main__':
    unittest.main()
