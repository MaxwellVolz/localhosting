# FastAPI Boilerplate

Production-ready FastAPI backend with SQLAlchemy, clean architecture, and CRUD examples.

## Quick Start

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env

# Initialize database
python init_db.py

# Run server
python run.py
```

Visit:
- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/docs
- **Health**: http://localhost:8000/health

## Structure

```
api/
├── app/
│   ├── main.py          # FastAPI app
│   ├── core/
│   │   ├── config.py    # Settings
│   │   └── database.py  # DB connection
│   ├── models/          # SQLAlchemy models
│   ├── schemas/         # Pydantic schemas
│   └── routers/         # API endpoints
├── tests/               # pytest tests
├── run.py              # Entry point
└── init_db.py          # DB initialization
```

## API Endpoints

**Health**:
- `GET /health` - Health check
- `GET /ping` - Ping/pong

**Items** (`/api/v1/items`):
- `GET /` - List items (paginated)
- `GET /{id}` - Get item
- `POST /` - Create item
- `PUT /{id}` - Update item
- `DELETE /{id}` - Delete item

## Example Usage

```bash
# Create item
curl -X POST http://localhost:8000/api/v1/items \
  -H "Content-Type: application/json" \
  -d '{"name": "Laptop", "price": 1200, "is_available": true}'

# Get all items
curl http://localhost:8000/api/v1/items

# Update item
curl -X PUT http://localhost:8000/api/v1/items/1 \
  -H "Content-Type: application/json" \
  -d '{"price": 1100}'
```

## Configuration

Edit `.env`:

```env
APP_NAME="My API"
DEBUG=True
HOST=0.0.0.0
PORT=8000
DATABASE_URL=sqlite:///./app.db
CORS_ORIGINS=http://localhost:3000,http://localhost:8000
```

## Testing

```bash
pytest
pytest --cov=app tests/
```

## Deployment

See [../hosting/README.md](../hosting/README.md) for deployment with NGINX + Cloudflare Tunnel.

### Production

```bash
# With Gunicorn
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Systemd Service

```ini
[Unit]
Description=FastAPI Backend
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/api
ExecStart=/var/www/api/venv/bin/uvicorn app:app --host 127.0.0.1 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

### NGINX Proxy

```nginx
location /api/ {
    proxy_pass http://localhost:8000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

## Adding Endpoints

1. Create model in `app/models/`
2. Create schema in `app/schemas/`
3. Create router in `app/routers/`
4. Register router in `app/main.py`
5. Run `python init_db.py` to update DB

## Resources

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [SQLAlchemy Docs](https://docs.sqlalchemy.org/)
- [Pydantic Docs](https://docs.pydantic.dev/)
