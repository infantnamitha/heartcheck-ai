# 💗 HeartCheck AI — Full Stack Relationship Health App

A romantic, AI-powered relationship health assessment application built with Django REST Framework + React.

---

## 📁 Folder Structure

```
heartcheck/
├── backend/                     # Django REST API
│   ├── heartcheck_api/
│   │   ├── settings.py          # Django config, JWT, CORS
│   │   └── urls.py              # Root URL routing
│   ├── api/
│   │   ├── models.py            # Question, Answer, Score, GiftSuggestion, UserProfile
│   │   ├── serializers.py       # DRF serializers
│   │   ├── views.py             # API views + scoring engine
│   │   ├── urls.py              # /api/* endpoints
│   │   └── fixtures/
│   │       └── initial_data.json  # 25 questions + 11 gift suggestions
│   ├── manage.py
│   └── requirements.txt
│
└── frontend/                    # React app
    ├── src/
    │   ├── api/
    │   │   └── axios.js         # Axios instance + JWT interceptors
    │   ├── context/
    │   │   └── AuthContext.js   # Auth state + login/register/logout
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   ├── Dashboard.js     # Score overview + mood + chart
    │   │   ├── Quiz.js          # Step-by-step animated quiz
    │   │   ├── Results.js       # Radar chart + advice + gifts
    │   │   └── Profile.js       # Edit profile + partner + anniversary
    │   ├── components/
    │   │   └── Navbar.js        # Fixed top nav + mobile menu
    │   ├── App.js               # Routes + protected route guards
    │   ├── index.css            # Tailwind + Google Fonts + custom classes
    │   └── index.js
    ├── tailwind.config.js
    ├── .env                     # REACT_APP_API_URL
    └── package.json
```

---

## 🚀 Local Setup

### Backend

```bash
cd backend

# 1. Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers

# 3. Save requirements
pip freeze > requirements.txt

# 4. Run migrations
python manage.py makemigrations api
python manage.py migrate

# 5. Load sample data (25 questions + gifts)
python manage.py loaddata api/fixtures/initial_data.json

# 6. Create admin (optional)
python manage.py createsuperuser

# 7. Start server
python manage.py runserver
# API available at: http://localhost:8000/api/
```

### Frontend

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Set API URL (already set in .env)
# REACT_APP_API_URL=http://localhost:8000/api

# 3. Start dev server
npm start
# App available at: http://localhost:3000
```

---

## 🔌 API Endpoints

| Method | Endpoint             | Auth | Description |
|--------|----------------------|------|-------------|
| POST   | /api/register        | No   | Create account, returns JWT |
| POST   | /api/login           | No   | Login, returns JWT |
| GET    | /api/questions       | Yes  | Get all 25 questions |
| POST   | /api/submit-answers  | Yes  | Submit answers, get scored |
| GET    | /api/results         | Yes  | Get latest result + advice + gifts |
| GET    | /api/history         | Yes  | Get last 10 quiz scores |
| GET    | /api/profile         | Yes  | Get user profile |
| PATCH  | /api/profile         | Yes  | Update profile/partner/anniversary/mood |
| POST   | /api/token/refresh/  | No   | Refresh JWT access token |

### Submit Answers Payload
```json
{
  "answers": [
    { "question_id": 1, "answer_value": 10 },
    { "question_id": 2, "answer_value": 5 },
    ...
  ]
}
```
answer_value: 10 = Always, 5 = Sometimes, 0 = Never

---

## 🧮 Scoring Logic

- Max score: 25 questions × 10 = **250 points**
- Toxic questions use **reverse scoring**: Always(10)→0, Sometimes(5)→5, Never(0)→10
- **Healthy** (❤️): 180–250
- **Needs Improvement** (😊): 100–179
- **Toxic Warning** (⚠️): Below 100

Categories: Trust, Communication, Emotional Safety, Effort, Support, Toxic

---

## ☁️ Deployment

### Backend on Render

1. Push backend folder to GitHub
2. Create new **Web Service** on [render.com](https://render.com)
3. Set Build Command: `pip install -r requirements.txt && python manage.py migrate && python manage.py loaddata api/fixtures/initial_data.json`
4. Set Start Command: `gunicorn heartcheck_api.wsgi:application`
5. Add environment variables:
   ```
   SECRET_KEY=your-production-secret-key
   DEBUG=False
   ALLOWED_HOSTS=your-app.onrender.com
   ```
6. Add `gunicorn` to requirements.txt

### Frontend on Vercel

1. Push frontend folder to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Add environment variable:
   ```
   REACT_APP_API_URL=https://your-backend.onrender.com/api
   ```
4. Deploy!

### Django settings for production

```python
# In settings.py
import os
SECRET_KEY = os.environ.get('SECRET_KEY')
DEBUG = os.environ.get('DEBUG', 'False') == 'True'
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '').split(',')
CORS_ALLOWED_ORIGINS = ['https://your-app.vercel.app']
```

---

## 🌟 Features

- ✅ JWT Authentication (register/login/refresh)
- ✅ 25-question relationship health quiz
- ✅ Animated step-by-step quiz UI
- ✅ Reverse scoring for toxic questions
- ✅ Radar chart + line progress chart
- ✅ Personalized advice by category
- ✅ Gift suggestions based on result
- ✅ Mood tracker
- ✅ Anniversary countdown
- ✅ Quiz history (last 10 sessions)
- ✅ Mobile responsive
- ✅ Framer Motion animations
- ✅ Protected routes
- ✅ Admin panel at /admin/

---

## 🎨 Tech Stack

| Layer     | Technology |
|-----------|------------|
| Backend   | Django 5 + DRF |
| Auth      | JWT (simplejwt) |
| DB        | SQLite (dev) / PostgreSQL (prod) |
| Frontend  | React 18 |
| Styling   | Tailwind CSS 3 |
| Charts    | Recharts |
| Animation | Framer Motion |
| HTTP      | Axios |
