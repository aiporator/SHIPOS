"""
Iteration 54 - Events System V2 Tests
Tests for the premium event hub with tabs, calendar integration, and focus times.
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials (dev-only seed accounts, override via env in CI)
TEST_EMAIL = os.environ.get("TEST_USER_EMAIL", "test@test.com")
TEST_PASSWORD = os.environ.get("TEST_USER_PASSWORD", "test123")


class TestEventsAPI:
    """Test the new Events V2 API endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup for each test - get auth token"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login to get token
        response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            token = response.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
        time.sleep(0.5)  # Rate limit protection
    
    def test_get_all_events_returns_15(self):
        """GET /api/events should return 15 seed events"""
        time.sleep(0.5)
        response = self.session.get(f"{BASE_URL}/api/events")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        events = response.json()
        assert isinstance(events, list), "Response should be a list"
        assert len(events) == 15, f"Expected 15 events, got {len(events)}"
        print(f"✓ GET /api/events returns {len(events)} events")
    
    def test_events_have_required_fields(self):
        """Each event should have google_calendar_url, ics_content, outcomes, access_level, host"""
        time.sleep(0.5)
        response = self.session.get(f"{BASE_URL}/api/events")
        assert response.status_code == 200
        
        events = response.json()
        for event in events:
            assert "google_calendar_url" in event, f"Event {event.get('title')} missing google_calendar_url"
            assert "ics_content" in event, f"Event {event.get('title')} missing ics_content"
            assert "outcomes" in event, f"Event {event.get('title')} missing outcomes"
            assert "access_level" in event, f"Event {event.get('title')} missing access_level"
            assert "host" in event, f"Event {event.get('title')} missing host"
            
            # Validate google_calendar_url format
            assert event["google_calendar_url"].startswith("https://www.google.com/calendar/render"), \
                f"Invalid google_calendar_url format for {event.get('title')}"
            
            # Validate ics_content format
            assert "BEGIN:VCALENDAR" in event["ics_content"], \
                f"Invalid ics_content format for {event.get('title')}"
            
            # Validate outcomes is a list
            assert isinstance(event["outcomes"], list), \
                f"outcomes should be a list for {event.get('title')}"
        
        print("✓ All events have required fields with valid formats")
    
    def test_live_tab_filter(self):
        """GET /api/events?tab=live should return only live/workshop events (not replays, not focus, not accelerator)"""
        time.sleep(0.5)
        response = self.session.get(f"{BASE_URL}/api/events?tab=live")
        assert response.status_code == 200
        
        events = response.json()
        for event in events:
            assert event.get("event_type") not in ("replay", "focus_session"), \
                f"Live tab should not include {event.get('event_type')} events"
            assert event.get("access_level") != "accelerator", \
                "Live tab should not include accelerator events"
        
        print(f"✓ GET /api/events?tab=live returns {len(events)} live/workshop events")
    
    def test_replay_tab_filter(self):
        """GET /api/events?tab=replay should return only replay events"""
        time.sleep(0.5)
        response = self.session.get(f"{BASE_URL}/api/events?tab=replay")
        assert response.status_code == 200
        
        events = response.json()
        assert len(events) > 0, "Should have at least one replay event"
        for event in events:
            assert event.get("event_type") == "replay", \
                f"Replay tab should only include replay events, got {event.get('event_type')}"
        
        print(f"✓ GET /api/events?tab=replay returns {len(events)} replay events")
    
    def test_private_tab_filter(self):
        """GET /api/events?tab=private should return only accelerator events"""
        time.sleep(0.5)
        response = self.session.get(f"{BASE_URL}/api/events?tab=private")
        assert response.status_code == 200
        
        events = response.json()
        assert len(events) > 0, "Should have at least one accelerator event"
        for event in events:
            assert event.get("access_level") == "accelerator", \
                f"Private tab should only include accelerator events, got {event.get('access_level')}"
        
        print(f"✓ GET /api/events?tab=private returns {len(events)} accelerator events")
    
    def test_focus_tab_filter(self):
        """GET /api/events?tab=focus should return only focus_session events"""
        time.sleep(0.5)
        response = self.session.get(f"{BASE_URL}/api/events?tab=focus")
        assert response.status_code == 200
        
        events = response.json()
        assert len(events) > 0, "Should have at least one focus session event"
        for event in events:
            assert event.get("event_type") == "focus_session", \
                f"Focus tab should only include focus_session events, got {event.get('event_type')}"
        
        print(f"✓ GET /api/events?tab=focus returns {len(events)} focus session events")
    
    def test_event_registration(self):
        """POST /api/events/{event_id}/register should work"""
        time.sleep(0.5)
        # Get an event to register for
        events_response = self.session.get(f"{BASE_URL}/api/events?tab=live")
        events = events_response.json()
        assert len(events) > 0, "Need at least one event to test registration"
        
        event_id = events[0]["event_id"]
        
        # First unregister if already registered
        time.sleep(0.5)
        self.session.post(f"{BASE_URL}/api/events/{event_id}/unregister")
        
        # Now register
        time.sleep(0.5)
        response = self.session.post(f"{BASE_URL}/api/events/{event_id}/register")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "message" in data, "Response should have message"
        print(f"✓ POST /api/events/{event_id}/register returns 200")
    
    def test_event_unregistration(self):
        """POST /api/events/{event_id}/unregister should work"""
        time.sleep(0.5)
        # Get an event
        events_response = self.session.get(f"{BASE_URL}/api/events?tab=live")
        events = events_response.json()
        assert len(events) > 0, "Need at least one event to test unregistration"
        
        event_id = events[0]["event_id"]
        
        # First register
        time.sleep(0.5)
        self.session.post(f"{BASE_URL}/api/events/{event_id}/register")
        
        # Now unregister
        time.sleep(0.5)
        response = self.session.post(f"{BASE_URL}/api/events/{event_id}/unregister")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "message" in data, "Response should have message"
        print(f"✓ POST /api/events/{event_id}/unregister returns 200")
    
    def test_event_detail(self):
        """GET /api/events/{event_id} should return event details"""
        time.sleep(0.5)
        # Get an event
        events_response = self.session.get(f"{BASE_URL}/api/events")
        events = events_response.json()
        assert len(events) > 0, "Need at least one event"
        
        event_id = events[0]["event_id"]
        
        time.sleep(0.5)
        response = self.session.get(f"{BASE_URL}/api/events/{event_id}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        event = response.json()
        assert event.get("event_id") == event_id
        assert "google_calendar_url" in event
        assert "ics_content" in event
        assert "is_registered" in event
        print(f"✓ GET /api/events/{event_id} returns event details")


class TestFocusTimesAPI:
    """Test the Focus Times CRUD API"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup for each test - get auth token"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login to get token
        response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            token = response.json().get("token")
            self.session.headers.update({"Authorization": f"Bearer {token}"})
        time.sleep(0.5)
    
    def test_get_focus_times(self):
        """GET /api/focus-times should return user's focus time slots"""
        time.sleep(0.5)
        response = self.session.get(f"{BASE_URL}/api/focus-times")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        slots = response.json()
        assert isinstance(slots, list), "Response should be a list"
        print(f"✓ GET /api/focus-times returns {len(slots)} slots")
    
    def test_save_focus_times(self):
        """POST /api/focus-times should save focus time slots"""
        time.sleep(0.5)
        test_slots = [
            {"day": "monday", "start_time": "09:00", "end_time": "10:30", "session_type": "deep_work"},
            {"day": "wednesday", "start_time": "14:00", "end_time": "15:30", "session_type": "review"},
        ]
        
        response = self.session.post(f"{BASE_URL}/api/focus-times", json={"slots": test_slots})
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "message" in data
        assert data.get("count") == 2, f"Expected count 2, got {data.get('count')}"
        
        # Verify slots were saved
        time.sleep(0.5)
        get_response = self.session.get(f"{BASE_URL}/api/focus-times")
        saved_slots = get_response.json()
        assert len(saved_slots) == 2, f"Expected 2 saved slots, got {len(saved_slots)}"
        
        print("✓ POST /api/focus-times saves slots correctly")
    
    def test_delete_focus_time(self):
        """DELETE /api/focus-times/{slot_id} should delete a slot"""
        time.sleep(0.5)
        # First create a slot
        test_slots = [
            {"day": "friday", "start_time": "10:00", "end_time": "11:00", "session_type": "planning"},
        ]
        self.session.post(f"{BASE_URL}/api/focus-times", json={"slots": test_slots})
        
        # Get the slot ID
        time.sleep(0.5)
        get_response = self.session.get(f"{BASE_URL}/api/focus-times")
        slots = get_response.json()
        
        if len(slots) > 0:
            slot_id = slots[0]["slot_id"]
            
            # Delete the slot
            time.sleep(0.5)
            response = self.session.delete(f"{BASE_URL}/api/focus-times/{slot_id}")
            assert response.status_code == 200, f"Expected 200, got {response.status_code}"
            
            data = response.json()
            assert "message" in data
            print(f"✓ DELETE /api/focus-times/{slot_id} deletes slot")
        else:
            print("⚠ No slots to delete, skipping delete test")


class TestEventCounts:
    """Test that event counts match expected values"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup for each test"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        time.sleep(0.5)
    
    def test_event_type_distribution(self):
        """Verify event type distribution across tabs"""
        time.sleep(0.5)
        response = self.session.get(f"{BASE_URL}/api/events")
        assert response.status_code == 200
        
        events = response.json()
        
        # Count by type
        type_counts = {}
        access_counts = {}
        for event in events:
            event_type = event.get("event_type", "unknown")
            access_level = event.get("access_level", "unknown")
            type_counts[event_type] = type_counts.get(event_type, 0) + 1
            access_counts[access_level] = access_counts.get(access_level, 0) + 1
        
        print(f"Event types: {type_counts}")
        print(f"Access levels: {access_counts}")
        
        # Verify we have events of each type
        assert "live" in type_counts or "workshop" in type_counts, "Should have live or workshop events"
        assert "replay" in type_counts, "Should have replay events"
        assert "focus_session" in type_counts, "Should have focus_session events"
        assert "accelerator" in access_counts, "Should have accelerator events"
        
        print("✓ Event type distribution verified")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
