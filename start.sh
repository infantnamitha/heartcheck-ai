#!/bin/bash
set -e

echo ""
echo "💗 Starting HeartCheck AI..."
echo ""

# ── Backend ──────────────────────────────────────────
echo "🐍 Setting up Django backend..."
cd "$(dirname "$0")/backend"

python3 -m venv venv 2>/dev/null || true
source venv/bin/activate

pip install -q django djangorestframework djangorestframework-simplejwt django-cors-headers gunicorn

python manage.py migrate --run-syncdb -v 0
python manage.py loaddata api/fixtures/initial_data.json 2>/dev/null || true

echo "✅ Backend ready — starting on http://localhost:8000"
python manage.py runserver 0.0.0.0:8000 &
BACKEND_PID=$!

# ── Frontend ─────────────────────────────────────────
echo ""
echo "⚛️  Setting up React frontend..."
cd "$(dirname "$0")/frontend"

npm install --silent

echo "✅ Frontend ready — starting on http://localhost:3000"
REACT_APP_API_URL=http://localhost:8000/api npm start &
FRONTEND_PID=$!

# ── Cleanup on exit ───────────────────────────────────
trap "echo ''; echo '🛑 Shutting down...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT INT TERM

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  💗 HeartCheck AI is running!"
echo "  🌐 Open: http://localhost:3000"
echo "  🔌 API:  http://localhost:8000/api"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Press Ctrl+C to stop"
echo ""

wait
