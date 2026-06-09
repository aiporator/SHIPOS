"""
Iteration 50 - Third Code Quality Review Testing
Tests for:
1. Backend APIs: /api/dashboard-v4, /api/my-path, /api/credits
2. Verifies BotMascot split refactoring didn't break any backend functionality
"""
import pytest
import requests
import os
from conftest import TEST_EMAIL, TEST_PASSWORD

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestBackendAPIs:
    """Test backend APIs for iteration 50"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session with authentication"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login to get session
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if login_response.status_code != 200:
            pytest.skip("Authentication failed - skipping authenticated tests")
    
    # Dashboard-v4 Tests
    def test_dashboard_v4_returns_200(self):
        """Test /api/dashboard-v4 returns 200 OK"""
        response = self.session.get(f"{BASE_URL}/api/dashboard-v4")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    
    def test_dashboard_v4_has_challenge30_summary(self):
        """Test dashboard-v4 has challenge30 summary"""
        response = self.session.get(f"{BASE_URL}/api/dashboard-v4")
        data = response.json()
        assert "challenge30" in data, "Missing challenge30 in dashboard response"
    
    def test_dashboard_v4_has_leader_score(self):
        """Test dashboard-v4 has leader_score with composite, leadership, eq, communication"""
        response = self.session.get(f"{BASE_URL}/api/dashboard-v4")
        data = response.json()
        assert "leader_score" in data, "Missing leader_score in dashboard response"
        leader_score = data["leader_score"]
        assert "composite" in leader_score, "Missing composite in leader_score"
        assert "leadership" in leader_score, "Missing leadership in leader_score"
        assert "eq" in leader_score, "Missing eq in leader_score"
        assert "communication" in leader_score, "Missing communication in leader_score"
    
    def test_dashboard_v4_has_weekly_activity(self):
        """Test dashboard-v4 has weekly_activity with 7 days"""
        response = self.session.get(f"{BASE_URL}/api/dashboard-v4")
        data = response.json()
        assert "weekly_activity" in data, "Missing weekly_activity in dashboard response"
        assert len(data["weekly_activity"]) == 7, f"Expected 7 days, got {len(data['weekly_activity'])}"
    
    # My-Path Tests
    def test_my_path_returns_200(self):
        """Test /api/my-path returns 200 OK"""
        response = self.session.get(f"{BASE_URL}/api/my-path")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    
    def test_my_path_has_5_levels(self):
        """Test my-path has exactly 5 levels"""
        response = self.session.get(f"{BASE_URL}/api/my-path")
        data = response.json()
        assert "levels" in data, "Missing levels in my-path response"
        assert len(data["levels"]) == 5, f"Expected 5 levels, got {len(data['levels'])}"
    
    def test_my_path_has_german_level_names(self):
        """Test my-path has German level names"""
        response = self.session.get(f"{BASE_URL}/api/my-path")
        data = response.json()
        expected_names = ["Teamplayer", "Mentor", "Kommunikator", "Strategischer Denker", "Visionär"]
        actual_names = [level["level"] for level in data["levels"]]
        for name in expected_names:
            assert name in actual_names, f"Missing level name: {name}"
    
    def test_my_path_has_certificates(self):
        """Test my-path has certificates array"""
        response = self.session.get(f"{BASE_URL}/api/my-path")
        data = response.json()
        assert "certificates" in data, "Missing certificates in my-path response"
        assert isinstance(data["certificates"], list), "certificates should be a list"
    
    def test_my_path_levels_have_complete_structure(self):
        """Test my-path levels have complete data structure"""
        response = self.session.get(f"{BASE_URL}/api/my-path")
        data = response.json()
        for level in data["levels"]:
            assert "level" in level, "Missing level in level object"
            assert "min_xp" in level, "Missing min_xp in level"
            assert "is_unlocked" in level, "Missing is_unlocked in level"
    
    # Credits Tests
    def test_credits_returns_200(self):
        """Test /api/credits returns 200 OK"""
        response = self.session.get(f"{BASE_URL}/api/credits")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    
    def test_credits_has_balance(self):
        """Test credits has balance field"""
        response = self.session.get(f"{BASE_URL}/api/credits")
        data = response.json()
        assert "balance" in data, "Missing balance in credits response"
    
    def test_credits_has_limit_for_free_users(self):
        """Test credits has limit=50 for free users"""
        response = self.session.get(f"{BASE_URL}/api/credits")
        data = response.json()
        assert "limit" in data, "Missing limit in credits response"
        assert data["limit"] == 50, f"Expected limit=50, got {data['limit']}"
    
    def test_credits_has_is_premium(self):
        """Test credits has is_premium field"""
        response = self.session.get(f"{BASE_URL}/api/credits")
        data = response.json()
        assert "is_premium" in data, "Missing is_premium in credits response"


class TestAuthenticationRequired:
    """Test that endpoints require authentication"""
    
    def test_dashboard_v4_requires_auth(self):
        """Test /api/dashboard-v4 requires authentication"""
        response = requests.get(f"{BASE_URL}/api/dashboard-v4")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
    
    def test_my_path_requires_auth(self):
        """Test /api/my-path requires authentication"""
        response = requests.get(f"{BASE_URL}/api/my-path")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
    
    def test_credits_requires_auth(self):
        """Test /api/credits requires authentication"""
        response = requests.get(f"{BASE_URL}/api/credits")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"


class TestLoginEndpoint:
    """Test login endpoint"""
    
    def test_login_success(self):
        """Test login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "user" in data, "Missing user in login response"
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@test.com",
            "password": "wrongpass"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
