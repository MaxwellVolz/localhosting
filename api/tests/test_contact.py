from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_contact_form_valid():
    """Test contact form with valid data"""
    response = client.post(
        "/api/v1/contact/",
        json={
            "name": "John Doe",
            "email": "john@example.com",
            "phone": "555-1234",
            "message": "Test message"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "timestamp" in data
    assert "Thank you" in data["message"]


def test_contact_form_minimal():
    """Test contact form with minimal required fields"""
    response = client.post(
        "/api/v1/contact/",
        json={
            "name": "Jane",
            "email": "jane@example.com",
            "phone": "555-5678"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True


def test_contact_form_invalid_email():
    """Test contact form with invalid email"""
    response = client.post(
        "/api/v1/contact/",
        json={
            "name": "John Doe",
            "email": "not-an-email",
            "phone": "555-1234"
        }
    )
    assert response.status_code == 422  # Validation error


def test_contact_form_missing_fields():
    """Test contact form with missing required fields"""
    response = client.post(
        "/api/v1/contact/",
        json={
            "name": "John Doe"
            # Missing email and phone
        }
    )
    assert response.status_code == 422  # Validation error


def test_contact_form_sync_endpoint():
    """Test synchronous contact form endpoint"""
    response = client.post(
        "/api/v1/contact/send-now",
        json={
            "name": "John Doe",
            "email": "john@example.com",
            "phone": "555-1234"
        }
    )
    # Should return 200 even if email sending fails
    # (form is still received)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
