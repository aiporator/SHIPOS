"""
Iteration 48 - Code Quality Review Fixes Testing
Tests for:
1. Backend: /api/dashboard-v4 returns correct data (leader_score, streak, challenge30)
2. Backend: /api/chat/sessions returns sessions list
3. Backend: /api/my-path returns 5 levels (Teamplayer, Mentor, Kommunikator, Strategischer Denker, Visionär)
4. Backend: /api/credits returns balance and limit=50
5. Backend: /api/ki-news/daily returns quote + trends + fact
6. Backend: /api/challenge30/quiz/1 returns 10 questions
"""
import pytest
import requests
import os

# Import credentials from conftest
from conftest import TEST_EMAIL, TEST_PASSWORD

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

# German role-based level names
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


class TestDashboardV4:
    """Test /api/dashboard-v4 endpoint with refactored helper functions."""

    def test_dashboard_v4_returns_200(self, auth_headers):
        """Dashboard-v4 should return 200 OK."""
        response = requests.get(f"{BASE_URL}/api/dashboard-v4", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✓ GET /api/dashboard-v4 returns 200")

    def test_dashboard_v4_has_leader_score(self, auth_headers):
        """Dashboard-v4 should include leader_score with composite, leadership, eq, communication."""
        response = requests.get(f"{BASE_URL}/api/dashboard-v4", headers=auth_headers)
        data = response.json()
        
        assert "leader_score" in data, "Missing leader_score in response"
        ls = data["leader_score"]
        assert "composite" in ls, "Missing composite in leader_score"
        assert "leadership" in ls, "Missing leadership in leader_score"
        assert "eq" in ls, "Missing eq in leader_score"
        assert "communication" in ls, "Missing communication in leader_score"
        print(f"✓ leader_score present: composite={ls['composite']}, leadership={ls['leadership']}, eq={ls['eq']}, communication={ls['communication']}")

    def test_dashboard_v4_has_streak(self, auth_headers):
        """Dashboard-v4 should include streak data."""
        response = requests.get(f"{BASE_URL}/api/dashboard-v4", headers=auth_headers)
        data = response.json()
        
        assert "streak" in data, "Missing streak in response"
        streak = data["streak"]
        assert "days" in streak, "Missing days in streak"
        print(f"✓ streak present: {streak['days']} days")

    def test_dashboard_v4_has_challenge30(self, auth_headers):
        """Dashboard-v4 should include challenge30 summary from _get_challenge30_summary helper."""
        response = requests.get(f"{BASE_URL}/api/dashboard-v4", headers=auth_headers)
        data = response.json()
        
        assert "challenge30" in data, "Missing challenge30 in response"
        c30 = data["challenge30"]
        assert "completed" in c30, "Missing completed in challenge30"
        assert "current_day" in c30, "Missing current_day in challenge30"
        assert "progress_pct" in c30, "Missing progress_pct in challenge30"
        print(f"✓ challenge30 present: completed={c30['completed']}, current_day={c30['current_day']}, progress_pct={c30['progress_pct']}%")

    def test_dashboard_v4_has_weekly_activity(self, auth_headers):
        """Dashboard-v4 should include weekly_activity from _get_weekly_activity helper."""
        response = requests.get(f"{BASE_URL}/api/dashboard-v4", headers=auth_headers)
        data = response.json()
        
        assert "weekly_activity" in data, "Missing weekly_activity in response"
        activity = data["weekly_activity"]
        assert isinstance(activity, list), "weekly_activity should be a list"
        assert len(activity) == 7, f"Expected 7 days of activity, got {len(activity)}"
        
        # Check structure of activity items
        for item in activity:
            assert "date" in item, "Missing date in activity item"
            assert "day" in item, "Missing day in activity item"
        print(f"✓ weekly_activity present with {len(activity)} days")

    def test_dashboard_v4_has_suggestions(self, auth_headers):
        """Dashboard-v4 should include suggestions from _get_suggestions helper."""
        response = requests.get(f"{BASE_URL}/api/dashboard-v4", headers=auth_headers)
        data = response.json()
        
        assert "what_matters_today" in data, "Missing what_matters_today in response"
        wmt = data["what_matters_today"]
        assert "suggestions" in wmt, "Missing suggestions in what_matters_today"
        print(f"✓ suggestions present: {len(wmt['suggestions'])} suggestions")


class TestChatSessions:
    """Test /api/chat/sessions endpoint."""

    def test_chat_sessions_returns_200(self, auth_headers):
        """Chat sessions should return 200 OK."""
        response = requests.get(f"{BASE_URL}/api/chat/sessions", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✓ GET /api/chat/sessions returns 200")

    def test_chat_sessions_returns_list(self, auth_headers):
        """Chat sessions should return a list."""
        response = requests.get(f"{BASE_URL}/api/chat/sessions", headers=auth_headers)
        data = response.json()
        
        assert isinstance(data, list), f"Expected list, got {type(data)}"
        print(f"✓ chat/sessions returns list with {len(data)} sessions")


class TestMyPath:
    """Test /api/my-path endpoint with German role-based level names."""

    def test_my_path_returns_200(self, auth_headers):
        """My-path should return 200 OK."""
        response = requests.get(f"{BASE_URL}/api/my-path", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✓ GET /api/my-path returns 200")

    def test_my_path_has_5_levels(self, auth_headers):
        """My-path should return exactly 5 levels."""
        response = requests.get(f"{BASE_URL}/api/my-path", headers=auth_headers)
        data = response.json()
        
        assert "levels" in data, "Missing levels in response"
        levels = data["levels"]
        assert len(levels) == 5, f"Expected 5 levels, got {len(levels)}"
        print(f"✓ my-path returns {len(levels)} levels")

    def test_my_path_german_level_names(self, auth_headers):
        """My-path should have German role-based level names."""
        response = requests.get(f"{BASE_URL}/api/my-path", headers=auth_headers)
        data = response.json()
        
        levels = data["levels"]
        level_names = [lvl["level"] for lvl in levels]
        
        for expected in EXPECTED_LEVELS:
            assert expected in level_names, f"Missing level: {expected}"
        
        print(f"✓ German level names verified: {level_names}")

    def test_my_path_level_order(self, auth_headers):
        """My-path levels should be in correct order by index."""
        response = requests.get(f"{BASE_URL}/api/my-path", headers=auth_headers)
        data = response.json()
        
        levels = data["levels"]
        for i, level in enumerate(levels):
            assert level["index"] == i, f"Level {level['level']} has wrong index: {level['index']} (expected {i})"
        
        # Verify order matches expected
        assert levels[0]["level"] == "Teamplayer"
        assert levels[1]["level"] == "Mentor"
        assert levels[2]["level"] == "Kommunikator"
        assert levels[3]["level"] == "Strategischer Denker"
        assert levels[4]["level"] == "Visionär"
        print("✓ Level order verified: Teamplayer → Mentor → Kommunikator → Strategischer Denker → Visionär")

    def test_my_path_has_certificates(self, auth_headers):
        """My-path should include certificates array."""
        response = requests.get(f"{BASE_URL}/api/my-path", headers=auth_headers)
        data = response.json()
        
        assert "certificates" in data, "Missing certificates in response"
        certs = data["certificates"]
        assert isinstance(certs, list), "certificates should be a list"
        print(f"✓ certificates present: {len(certs)} certificates")

    def test_my_path_current_level(self, auth_headers):
        """My-path should include current_level field."""
        response = requests.get(f"{BASE_URL}/api/my-path", headers=auth_headers)
        data = response.json()
        
        assert "current_level" in data, "Missing current_level in response"
        assert data["current_level"] in EXPECTED_LEVELS, f"Invalid current_level: {data['current_level']}"
        print(f"✓ current_level: {data['current_level']}")


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
        # For free users, limit should be 50
        if not data.get("is_premium"):
            assert data["limit"] == 50, f"Expected limit=50, got {data['limit']}"
            print(f"✓ credits limit: {data['limit']} (free user)")
        else:
            print(f"✓ credits limit: {data['limit']} (premium user)")

    def test_credits_has_is_premium(self, auth_headers):
        """Credits should include is_premium field."""
        response = requests.get(f"{BASE_URL}/api/credits", headers=auth_headers)
        data = response.json()
        
        assert "is_premium" in data, "Missing is_premium in response"
        print(f"✓ is_premium: {data['is_premium']}")


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
        print(f"✓ quote_of_the_day present: '{quote['quote'][:50]}...' by {quote['author']}")

    def test_ki_news_has_trends(self, auth_headers):
        """KI-news should include trends array."""
        response = requests.get(f"{BASE_URL}/api/ki-news/daily", headers=auth_headers)
        data = response.json()
        
        assert "trends" in data, "Missing trends in response"
        trends = data["trends"]
        assert isinstance(trends, list), "trends should be a list"
        assert len(trends) >= 1, "Expected at least 1 trend"
        
        # Check trend structure
        for trend in trends:
            assert "title" in trend, "Missing title in trend"
            assert "summary" in trend, "Missing summary in trend"
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
        print(f"✓ fact_of_the_day present: '{fact['fact'][:50]}...' ({fact['source']})")


class TestChallenge30Quiz:
    """Test /api/challenge30/quiz/{day} endpoint."""

    def test_quiz_day1_returns_200(self, auth_headers):
        """Quiz day 1 should return 200 OK."""
        response = requests.get(f"{BASE_URL}/api/challenge30/quiz/1", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✓ GET /api/challenge30/quiz/1 returns 200")

    def test_quiz_day1_has_10_questions(self, auth_headers):
        """Quiz day 1 should have 10 questions."""
        response = requests.get(f"{BASE_URL}/api/challenge30/quiz/1", headers=auth_headers)
        data = response.json()
        
        assert "questions" in data, "Missing questions in response"
        questions = data["questions"]
        assert len(questions) == 10, f"Expected 10 questions, got {len(questions)}"
        print(f"✓ quiz/1 has {len(questions)} questions")

    def test_quiz_day1_question_structure(self, auth_headers):
        """Quiz questions should have proper structure."""
        response = requests.get(f"{BASE_URL}/api/challenge30/quiz/1", headers=auth_headers)
        data = response.json()
        
        questions = data["questions"]
        for i, q in enumerate(questions):
            assert "q" in q, f"Question {i} missing 'q' field"
            assert "type" in q, f"Question {i} missing 'type' field"
        print("✓ All questions have required fields (q, type)")

    def test_quiz_has_challenge_info(self, auth_headers):
        """Quiz should include challenge metadata."""
        response = requests.get(f"{BASE_URL}/api/challenge30/quiz/1", headers=auth_headers)
        data = response.json()
        
        assert "day" in data, "Missing day in response"
        assert "challenge" in data, "Missing challenge in response"
        assert data["day"] == 1, f"Expected day=1, got {data['day']}"
        print(f"✓ challenge info present: day={data['day']}, title={data['challenge'].get('title_de', 'N/A')}")


class TestAuthRequired:
    """Test that endpoints require authentication."""

    def test_dashboard_v4_requires_auth(self):
        """Dashboard-v4 should return 401 without auth."""
        response = requests.get(f"{BASE_URL}/api/dashboard-v4")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ /api/dashboard-v4 requires authentication")

    def test_my_path_requires_auth(self):
        """My-path should return 401 without auth."""
        response = requests.get(f"{BASE_URL}/api/my-path")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ /api/my-path requires authentication")

    def test_credits_requires_auth(self):
        """Credits should return 401 without auth."""
        response = requests.get(f"{BASE_URL}/api/credits")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ /api/credits requires authentication")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
