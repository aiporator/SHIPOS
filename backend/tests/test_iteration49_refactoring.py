"""
Iteration 49 - Second Code Quality Review Fixes Testing
Tests for refactored backend modules:
1. challengers.py: _parse_challenge_result helper
2. auth.py: _sanitize_rating_preferences + _sanitize_company_context + module-level validation sets
3. my_path.py: _build_level_data + _build_certificates helpers
4. PUT /api/auth/profile with sanitization helpers
5. /api/challengers returns challenger list
6. /api/dashboard-v4 full data verification
7. /api/my-path returns 5 levels with certificates
8. /api/credits returns balance and limit=50
9. /api/ki-news/daily returns quote + trends + fact
"""
import pytest
import requests
import os

from conftest import TEST_EMAIL, TEST_PASSWORD

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

EXPECTED_LEVELS = ["Teamplayer", "Mentor", "Kommunikator", "Strategischer Denker", "Visionär"]


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for test user."""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code != 200:
        pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")
    return response.json().get("token")


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Return headers with auth token."""
    return {"Authorization": f"Bearer {auth_token}"}


class TestChallengers:
    """Test /api/challengers endpoint (challengers.py refactored with _parse_challenge_result)."""

    def test_challengers_returns_200(self):
        """Challengers list should return 200 OK (no auth required)."""
        response = requests.get(f"{BASE_URL}/api/challengers")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✓ GET /api/challengers returns 200")

    def test_challengers_returns_list(self):
        """Challengers should return a list of challengers."""
        response = requests.get(f"{BASE_URL}/api/challengers")
        data = response.json()
        
        assert isinstance(data, list), f"Expected list, got {type(data)}"
        assert len(data) > 0, "Expected at least 1 challenger"
        print(f"✓ challengers returns list with {len(data)} challengers")

    def test_challengers_structure(self):
        """Each challenger should have required fields."""
        response = requests.get(f"{BASE_URL}/api/challengers")
        data = response.json()
        
        for challenger in data:
            assert "challenger_id" in challenger, "Missing challenger_id"
            assert "name" in challenger, "Missing name"
        print("✓ All challengers have required fields (challenger_id, name)")


class TestAuthProfile:
    """Test PUT /api/auth/profile with sanitization helpers (_sanitize_rating_preferences, _sanitize_company_context)."""

    def test_profile_update_name(self, auth_headers):
        """Profile update should work for basic fields."""
        response = requests.put(f"{BASE_URL}/api/auth/profile", 
            headers=auth_headers,
            json={"name": "Test User Updated"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data.get("name") == "Test User Updated", "Name not updated"
        print("✓ PUT /api/auth/profile updates name successfully")
        
        # Restore original name
        requests.put(f"{BASE_URL}/api/auth/profile", 
            headers=auth_headers,
            json={"name": "Test User"}
        )

    def test_profile_update_rating_preferences_sanitized(self, auth_headers):
        """Rating preferences should be sanitized via _sanitize_rating_preferences helper."""
        # Valid rating preferences
        valid_prefs = {
            "mode": "soft",
            "level": "fortgeschritten",
            "focus": ["klarheit", "empathie"],
            "audience": "team"
        }
        response = requests.put(f"{BASE_URL}/api/auth/profile", 
            headers=auth_headers,
            json={"rating_preferences": valid_prefs}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        rp = data.get("rating_preferences", {})
        assert rp.get("mode") == "soft", "mode not set correctly"
        assert rp.get("level") == "fortgeschritten", "level not set correctly"
        print("✓ PUT /api/auth/profile sanitizes rating_preferences correctly")

    def test_profile_update_rating_preferences_invalid_filtered(self, auth_headers):
        """Invalid rating preferences should be filtered out by sanitization."""
        invalid_prefs = {
            "mode": "invalid_mode",  # Should be filtered
            "level": "executive",     # Valid
            "focus": ["klarheit", "invalid_focus"],  # invalid_focus should be filtered
            "audience": "invalid_audience"  # Should be filtered
        }
        response = requests.put(f"{BASE_URL}/api/auth/profile", 
            headers=auth_headers,
            json={"rating_preferences": invalid_prefs}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        rp = data.get("rating_preferences", {})
        # Invalid mode should not be set
        assert rp.get("mode") != "invalid_mode", "Invalid mode should be filtered"
        # Valid level should be set
        assert rp.get("level") == "executive", "Valid level should be set"
        # Focus should only contain valid values
        if "focus" in rp:
            assert "invalid_focus" not in rp["focus"], "Invalid focus should be filtered"
        print("✓ PUT /api/auth/profile filters invalid rating_preferences")

    def test_profile_update_company_context_sanitized(self, auth_headers):
        """Company context should be sanitized via _sanitize_company_context helper."""
        valid_context = {
            "team_size": "10-50",
            "branche": "Tech",
            "challenges": "Scaling",
            "goals": "Growth",
            "people_notes": "Great team",
            "ai_tasks_enabled": True
        }
        response = requests.put(f"{BASE_URL}/api/auth/profile", 
            headers=auth_headers,
            json={"company_context": valid_context}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        cc = data.get("company_context", {})
        assert cc.get("team_size") == "10-50", "team_size not set"
        assert cc.get("branche") == "Tech", "branche not set"
        print("✓ PUT /api/auth/profile sanitizes company_context correctly")

    def test_profile_update_company_context_extra_fields_filtered(self, auth_headers):
        """Extra fields in company_context should be filtered out."""
        context_with_extra = {
            "team_size": "5-10",
            "branche": "Finance",
            "extra_field": "should_be_filtered",  # Not in COMPANY_CONTEXT_FIELDS
            "malicious_field": "<script>alert('xss')</script>"  # Should be filtered
        }
        response = requests.put(f"{BASE_URL}/api/auth/profile", 
            headers=auth_headers,
            json={"company_context": context_with_extra}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        cc = data.get("company_context", {})
        assert "extra_field" not in cc, "Extra field should be filtered"
        assert "malicious_field" not in cc, "Malicious field should be filtered"
        print("✓ PUT /api/auth/profile filters extra company_context fields")


class TestDashboardV4:
    """Test /api/dashboard-v4 endpoint returns full data."""

    def test_dashboard_v4_returns_200(self, auth_headers):
        """Dashboard-v4 should return 200 OK."""
        response = requests.get(f"{BASE_URL}/api/dashboard-v4", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✓ GET /api/dashboard-v4 returns 200")

    def test_dashboard_v4_has_challenge30(self, auth_headers):
        """Dashboard-v4 should include challenge30 summary."""
        response = requests.get(f"{BASE_URL}/api/dashboard-v4", headers=auth_headers)
        data = response.json()
        
        assert "challenge30" in data, "Missing challenge30 in response"
        c30 = data["challenge30"]
        assert "completed" in c30, "Missing completed in challenge30"
        assert "current_day" in c30, "Missing current_day in challenge30"
        print(f"✓ challenge30 present: completed={c30['completed']}, current_day={c30['current_day']}")

    def test_dashboard_v4_has_leader_score(self, auth_headers):
        """Dashboard-v4 should include leader_score."""
        response = requests.get(f"{BASE_URL}/api/dashboard-v4", headers=auth_headers)
        data = response.json()
        
        assert "leader_score" in data, "Missing leader_score in response"
        ls = data["leader_score"]
        assert "composite" in ls, "Missing composite in leader_score"
        assert "leadership" in ls, "Missing leadership in leader_score"
        assert "eq" in ls, "Missing eq in leader_score"
        assert "communication" in ls, "Missing communication in leader_score"
        print(f"✓ leader_score present: composite={ls['composite']}")

    def test_dashboard_v4_has_weekly_activity(self, auth_headers):
        """Dashboard-v4 should include weekly_activity (7 days)."""
        response = requests.get(f"{BASE_URL}/api/dashboard-v4", headers=auth_headers)
        data = response.json()
        
        assert "weekly_activity" in data, "Missing weekly_activity in response"
        activity = data["weekly_activity"]
        assert isinstance(activity, list), "weekly_activity should be a list"
        assert len(activity) == 7, f"Expected 7 days of activity, got {len(activity)}"
        print(f"✓ weekly_activity present with {len(activity)} days")


class TestMyPath:
    """Test /api/my-path endpoint (my_path.py refactored with _build_level_data, _build_certificates)."""

    def test_my_path_returns_200(self, auth_headers):
        """My-path should return 200 OK."""
        response = requests.get(f"{BASE_URL}/api/my-path", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✓ GET /api/my-path returns 200")

    def test_my_path_has_5_levels(self, auth_headers):
        """My-path should return exactly 5 levels (from _build_level_data helper)."""
        response = requests.get(f"{BASE_URL}/api/my-path", headers=auth_headers)
        data = response.json()
        
        assert "levels" in data, "Missing levels in response"
        levels = data["levels"]
        assert len(levels) == 5, f"Expected 5 levels, got {len(levels)}"
        print(f"✓ my-path returns {len(levels)} levels")

    def test_my_path_german_level_names(self, auth_headers):
        """My-path should have German level names (Teamplayer→Visionär)."""
        response = requests.get(f"{BASE_URL}/api/my-path", headers=auth_headers)
        data = response.json()
        
        levels = data["levels"]
        level_names = [lvl["level"] for lvl in levels]
        
        for expected in EXPECTED_LEVELS:
            assert expected in level_names, f"Missing level: {expected}"
        
        # Verify order
        assert levels[0]["level"] == "Teamplayer"
        assert levels[1]["level"] == "Mentor"
        assert levels[2]["level"] == "Kommunikator"
        assert levels[3]["level"] == "Strategischer Denker"
        assert levels[4]["level"] == "Visionär"
        print(f"✓ German level names verified: {level_names}")

    def test_my_path_has_certificates(self, auth_headers):
        """My-path should include certificates array (from _build_certificates helper)."""
        response = requests.get(f"{BASE_URL}/api/my-path", headers=auth_headers)
        data = response.json()
        
        assert "certificates" in data, "Missing certificates in response"
        certs = data["certificates"]
        assert isinstance(certs, list), "certificates should be a list"
        
        # Each certificate should have level, title, earned
        for cert in certs:
            assert "level" in cert, "Missing level in certificate"
            assert "title" in cert, "Missing title in certificate"
            assert "earned" in cert, "Missing earned in certificate"
        print(f"✓ certificates present: {len(certs)} certificates")

    def test_my_path_level_data_structure(self, auth_headers):
        """Each level should have complete data from _build_level_data helper."""
        response = requests.get(f"{BASE_URL}/api/my-path", headers=auth_headers)
        data = response.json()
        
        levels = data["levels"]
        required_fields = ["level", "index", "subtitle", "description", "color", "skills", 
                          "unlock_requirement", "certificate", "min_xp", "is_current", 
                          "is_unlocked", "is_next", "xp_progress"]
        
        for level in levels:
            for field in required_fields:
                assert field in level, f"Missing {field} in level {level.get('level', 'unknown')}"
        print("✓ All levels have complete data structure from _build_level_data")


class TestCredits:
    """Test /api/credits endpoint."""

    def test_credits_returns_200(self, auth_headers):
        """Credits should return 200 OK."""
        response = requests.get(f"{BASE_URL}/api/credits", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✓ GET /api/credits returns 200")

    def test_credits_has_balance(self, auth_headers):
        """Credits should include balance field."""
        response = requests.get(f"{BASE_URL}/api/credits", headers=auth_headers)
        data = response.json()
        
        assert "balance" in data, "Missing balance in response"
        print(f"✓ credits balance: {data['balance']}")

    def test_credits_has_limit_50(self, auth_headers):
        """Credits should have limit=50 for free users."""
        response = requests.get(f"{BASE_URL}/api/credits", headers=auth_headers)
        data = response.json()
        
        assert "limit" in data, "Missing limit in response"
        if not data.get("is_premium"):
            assert data["limit"] == 50, f"Expected limit=50, got {data['limit']}"
            print(f"✓ credits limit: {data['limit']} (free user)")
        else:
            print(f"✓ credits limit: {data['limit']} (premium user)")


class TestKiNewsDaily:
    """Test /api/ki-news/daily endpoint."""

    def test_ki_news_returns_200(self, auth_headers):
        """KI-news daily should return 200 OK."""
        response = requests.get(f"{BASE_URL}/api/ki-news/daily", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✓ GET /api/ki-news/daily returns 200")

    def test_ki_news_has_quote(self, auth_headers):
        """KI-news should include quote_of_the_day."""
        response = requests.get(f"{BASE_URL}/api/ki-news/daily", headers=auth_headers)
        data = response.json()
        
        assert "quote_of_the_day" in data, "Missing quote_of_the_day in response"
        quote = data["quote_of_the_day"]
        assert "author" in quote, "Missing author in quote"
        assert "quote" in quote, "Missing quote text"
        assert "insight" in quote, "Missing insight in quote"
        print("✓ quote_of_the_day present")

    def test_ki_news_has_trends(self, auth_headers):
        """KI-news should include trends array."""
        response = requests.get(f"{BASE_URL}/api/ki-news/daily", headers=auth_headers)
        data = response.json()
        
        assert "trends" in data, "Missing trends in response"
        trends = data["trends"]
        assert isinstance(trends, list), "trends should be a list"
        print(f"✓ trends present: {len(trends)} trends")

    def test_ki_news_has_fact(self, auth_headers):
        """KI-news should include fact_of_the_day."""
        response = requests.get(f"{BASE_URL}/api/ki-news/daily", headers=auth_headers)
        data = response.json()
        
        assert "fact_of_the_day" in data, "Missing fact_of_the_day in response"
        fact = data["fact_of_the_day"]
        assert "fact" in fact, "Missing fact text"
        assert "source" in fact, "Missing source in fact"
        assert "category" in fact, "Missing category in fact"
        print("✓ fact_of_the_day present")


class TestAuthRequired:
    """Test that endpoints require authentication."""

    def test_dashboard_v4_requires_auth(self):
        """Dashboard-v4 should return 401 without auth."""
        response = requests.get(f"{BASE_URL}/api/dashboard-v4")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ /api/dashboard-v4 requires authentication (401)")

    def test_my_path_requires_auth(self):
        """My-path should return 401 without auth."""
        response = requests.get(f"{BASE_URL}/api/my-path")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ /api/my-path requires authentication (401)")

    def test_credits_requires_auth(self):
        """Credits should return 401 without auth."""
        response = requests.get(f"{BASE_URL}/api/credits")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ /api/credits requires authentication (401)")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
