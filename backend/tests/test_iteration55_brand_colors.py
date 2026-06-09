"""
Iteration 55 - WLADHUB Brand Consistency Testing
Tests for brand color migration from indigo/violet to neon lime (#BFFF00)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestBackendAPIs:
    """Backend API health and functionality tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
    def test_health_endpoint(self):
        """Health endpoint returns 200"""
        response = self.session.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "ok"
        print("✓ Health endpoint working")
    
    def test_login_endpoint(self):
        """Login endpoint returns token"""
        response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "test123"
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        print("✓ Login endpoint working")
        return data["token"]
    
    def test_dashboard_endpoint(self):
        """Dashboard endpoint returns user data"""
        token = self.test_login_endpoint()
        response = self.session.get(
            f"{BASE_URL}/api/dashboard",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "user" in data
        print("✓ Dashboard endpoint working")
    
    def test_credits_endpoint(self):
        """Credits endpoint returns balance"""
        token = self.test_login_endpoint()
        response = self.session.get(
            f"{BASE_URL}/api/credits",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "balance" in data
        print("✓ Credits endpoint working")
    
    def test_events_endpoint(self):
        """Events endpoint returns event list"""
        response = self.session.get(f"{BASE_URL}/api/events")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"✓ Events endpoint working - {len(data)} events")
    
    def test_my_path_endpoint(self):
        """My Path endpoint returns level progression"""
        token = self.test_login_endpoint()
        response = self.session.get(
            f"{BASE_URL}/api/my-path",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "current_level" in data
        assert "levels" in data
        print("✓ My Path endpoint working")
    
    def test_video_challenges_endpoint(self):
        """Video challenges endpoint returns challenge list"""
        response = self.session.get(f"{BASE_URL}/api/video-challenges")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"✓ Video challenges endpoint working - {len(data)} challenges")
    
    def test_payments_packages_endpoint(self):
        """Payments packages endpoint returns package list"""
        response = self.session.get(f"{BASE_URL}/api/payments/packages")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"✓ Payments packages endpoint working - {len(data)} packages")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
