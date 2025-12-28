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

**Contact Form** (`/api/v1/contact`):
- `POST /` - Submit contact form (sends emails in background)
- `POST /send-now` - Submit contact form (waits for email confirmation)

**Items** (`/api/v1/items`):
- `GET /` - List items (paginated)
- `GET /{id}` - Get item
- `POST /` - Create item
- `PUT /{id}` - Update item
- `DELETE /{id}` - Delete item

## Example Usage

### Contact Form

```bash
# Submit contact form
curl -X POST http://localhost:8000/api/v1/contact/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "555-1234",
    "message": "Hello!"
  }'
```

See [CONTACT_FORM_SETUP.md](CONTACT_FORM_SETUP.md) for complete email configuration guide.

### Items CRUD

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

# Email settings (for contact form)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
CONTACT_EMAIL_RECIPIENT=your-email@gmail.com
```

**Email Setup**: See [CONTACT_FORM_SETUP.md](CONTACT_FORM_SETUP.md) for detailed email configuration.

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

#### Note

Deactivate your `venv` and setup python:

```sh
cd /var/www/api
sudo -u www-data python3 -m venv venv

sudo -u www-data /var/www/api/venv/bin/python -m pip install -r requirements.txt
```

For our linux box server we will copy `/localhosting/api` to the **Standard, boring, correct location**: `/var/www/api`

Create the following: `sudo vim /etc/systemd/system/fastapi.service`
```ini
[Unit]
Description=FastAPI Backend
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/api
ExecStart=/var/www/api/venv/bin/gunicorn app.main:app \
  -w 4 \
  -k uvicorn.workers.UvicornWorker \
  --bind 127.0.0.1:8000
Restart=always
Environment=PYTHONUNBUFFERED=1

[Install]
WantedBy=multi-user.target
```

Restart the service: 

```sh
sudo systemctl daemon-reexec

sudo systemctl daemon-reload

sudo systemctl restart fastapi
```

Check on it

```sh
sudo systemctl status fastapi
journalctl -u fastapi -f
```

### NGINX Proxy

Add to existing nginx setup: `vim /etc/nginx/sites-available/existingwebsite.com`

```nginx
# Proxy API requests to FastAPI
location /api/ {
    proxy_pass http://localhost:8000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
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
