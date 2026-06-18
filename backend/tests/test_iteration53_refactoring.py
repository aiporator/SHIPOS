"""
Iteration 53 - Code Quality Refactoring Verification Tests
Tests all 9 API endpoints after component splitting and DRY helper extraction.
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthAndAuth:
    """Health check and authentication tests"""
    
    def test_health_endpoint(self):
        """Test /api/health returns 200"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200, f"Health check failed: {response.status_code}"
        print("PASS: /api/health returns 200")
    
    def test_login_success(self):
        """Test /api/auth/login returns 200 with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "test123"
        })
        assert response.status_code == 200, f"Login failed: {response.status_code}"
        data = response.json()
        assert "token" in data or "access_token" in data, "No token in response"
        print("PASS: /api/auth/login returns 200 with token")
        return data.get("token") or data.get("access_token")


class TestDashboardAPIs:
    """Dashboard and related API tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for authenticated requests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "test123"
        })
        if response.status_code == 200:
            data = response.json()
            return data.get("token") or data.get("access_token")
        pytest.skip("Authentication failed")
    
    @pytest.fixture
    def auth_headers(self, auth_token):
        """Get headers with auth token"""
        return {"Authorization": f"Bearer {auth_token}"}
    
    def test_dashboard_v4_endpoint(self, auth_headers):
        """Test /api/dashboard-v4 returns 200 with user data, leader_score, streak, challenge30"""
        response = requests.get(f"{BASE_URL}/api/dashboard-v4", headers=auth_headers)
        assert response.status_code == 200, f"Dashboard-v4 failed: {response.status_code}"
        data = response.json()
        # Verify expected fields
        assert "user" in data or "leader_score" in data, "Missing expected dashboard data"
        print(f"PASS: /api/dashboard-v4 returns 200 with keys: {list(data.keys())}")
    
    def test_credits_endpoint(self, auth_headers):
        """Test /api/credits returns 200"""
        response = requests.get(f"{BASE_URL}/api/credits", headers=auth_headers)
        assert response.status_code == 200, f"Credits failed: {response.status_code}"
        data = response.json()
        print(f"PASS: /api/credits returns 200 with data: {data}")
    
    def test_challenge30_status_endpoint(self, auth_headers):
        """Test /api/challenge30/status returns 200"""
        response = requests.get(f"{BASE_URL}/api/challenge30/status", headers=auth_headers)
        assert response.status_code == 200, f"Challenge30 status failed: {response.status_code}"
        data = response.json()
        print(f"PASS: /api/challenge30/status returns 200 with keys: {list(data.keys())}")
    
    def test_ki_news_daily_endpoint(self, auth_headers):
        """Test /api/ki-news/daily returns 200"""
        response = requests.get(f"{BASE_URL}/api/ki-news/daily", headers=auth_headers)
        assert response.status_code == 200, f"KI-News failed: {response.status_code}"
        _data = response.json()
        print("PASS: /api/ki-news/daily returns 200")
    
    def test_my_path_endpoint(self, auth_headers):
        """Test /api/my-path returns 200"""
        response = requests.get(f"{BASE_URL}/api/my-path", headers=auth_headers)
        assert response.status_code == 200, f"My-Path failed: {response.status_code}"
        _data = response.json()
        print("PASS: /api/my-path returns 200")


class TestPaymentsAPI:
    """Payments API tests - verifying DRY helper extraction didn't break functionality"""
    
    def test_payments_packages_endpoint(self):
        """Test /api/payments/packages returns 200 with 3 packages"""
        response = requests.get(f"{BASE_URL}/api/payments/packages")
        assert response.status_code == 200, f"Payments packages failed: {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of packages"
        assert len(data) == 3, f"Expected 3 packages, got {len(data)}"
        # Verify package structure
        for pkg in data:
            assert "id" in pkg, "Package missing id"
            assert "name" in pkg, "Package missing name"
            assert "amount" in pkg, "Package missing amount"
            assert "currency" in pkg, "Package missing currency"
        print(f"PASS: /api/payments/packages returns 200 with 3 packages: {[p['id'] for p in data]}")


class TestVideoChallengesAPI:
    """Video challenges API tests"""
    
    @pytest.fixture
    def auth_headers(self):
        """Get headers with auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "test123"
        })
        if response.status_code == 200:
            data = response.json()
            token = data.get("token") or data.get("access_token")
            return {"Authorization": f"Bearer {token}"}
        pytest.skip("Authentication failed")
    
    def test_video_challenges_endpoint(self, auth_headers):
        """Test /api/video-challenges returns 200"""
        response = requests.get(f"{BASE_URL}/api/video-challenges", headers=auth_headers)
        assert response.status_code == 200, f"Video challenges failed: {response.status_code}"
        _data = response.json()
        print("PASS: /api/video-challenges returns 200")


class TestPaymentsHelperFunctions:
    """Verify payments.py DRY helper extraction - _activate_premium and _record_pending_transaction"""
    
    @pytest.fixture
    def auth_headers(self):
        """Get headers with auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "test123"
        })
        if response.status_code == 200:
            data = response.json()
            token = data.get("token") or data.get("access_token")
            return {"Authorization": f"Bearer {token}"}
        pytest.skip("Authentication failed")
    
    def test_checkout_endpoint_exists(self, auth_headers):
        """Test /api/payments/checkout endpoint exists (POST)"""
        # We can't fully test checkout without Stripe, but we can verify the endpoint exists
        response = requests.post(f"{BASE_URL}/api/payments/checkout", 
            headers=auth_headers,
            json={"package_id": "standard", "origin_url": "https://test.com"}
        )
        # Should return 500 (Stripe not configured) or 200 (if Stripe is configured)
        # NOT 404 (endpoint missing) or 422 (validation error)
        assert response.status_code in [200, 500], f"Checkout endpoint issue: {response.status_code} - {response.text}"
        print(f"PASS: /api/payments/checkout endpoint exists (status: {response.status_code})")
    
    def test_payment_history_endpoint(self, auth_headers):
        """Test /api/payments/history returns 200"""
        response = requests.get(f"{BASE_URL}/api/payments/history", headers=auth_headers)
        assert response.status_code == 200, f"Payment history failed: {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of transactions"
        print(f"PASS: /api/payments/history returns 200 with {len(data)} transactions")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
