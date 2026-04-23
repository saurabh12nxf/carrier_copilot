# 🚀 GenAI Career Copilot - Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ Files to VERIFY Before Pushing

**CRITICAL - These files MUST NOT be pushed:**
- ❌ `backend/.env` (contains API keys)
- ❌ `backend/career_copilot.db` (user data)
- ❌ `backend/chroma_db/` (vector database)
- ❌ `backend/venv/` (Python virtual environment)
- ❌ `Carrier-Copilot-new/frontend/node_modules/` (Node packages)
- ❌ Any `*.db` or `*.sqlite` files

**SAFE to push:**
- ✅ `backend/.env.example` (template without real keys)
- ✅ All `.py` source files
- ✅ All `.jsx` source files
- ✅ `requirements.txt`
- ✅ `package.json`
- ✅ Documentation files (README.md, etc.)

---

## 🔐 Environment Variables Setup

### Backend (.env file)
Create `backend/.env` with:
```env
# Gemini API (Primary LLM)
GEMINI_API_KEY=your_gemini_api_key_here

# OpenAI API (Fallback)
OPENAI_API_KEY=your_openai_api_key_here

# Groq API (Fast Fallback)
GROQ_API_KEY=your_groq_api_key_here
```

**Get API Keys:**
- Gemini: https://makersuite.google.com/app/apikey
- OpenAI: https://platform.openai.com/api-keys
- Groq: https://console.groq.com/keys

---

## 🛠️ Local Development Setup

### 1. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (copy from .env.example and add your keys)
cp .env.example .env
# Edit .env and add your API keys

# Run backend
uvicorn main:app --reload
```

Backend will run on: http://localhost:8000

### 2. Frontend Setup
```bash
cd Carrier-Copilot-new/frontend

# Install dependencies
npm install

# Run frontend
npm run dev
```

Frontend will run on: http://localhost:5173

---

## ☁️ Deployment Options

### Option 1: Vercel (Frontend) + Railway (Backend)

#### Frontend on Vercel:
1. Push code to GitHub
2. Go to https://vercel.com
3. Import your repository
4. Set root directory: `Carrier-Copilot-new/frontend`
5. Build command: `npm run build`
6. Output directory: `dist`
7. Deploy!

#### Backend on Railway:
1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select your repository
4. Set root directory: `backend`
5. Add environment variables:
   - `GEMINI_API_KEY`
   - `OPENAI_API_KEY`
   - `GROQ_API_KEY`
6. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
7. Deploy!

**Update Frontend API URL:**
In `Carrier-Copilot-new/frontend/src/` files, replace:
```javascript
http://localhost:8000
```
with your Railway backend URL:
```javascript
https://your-app.railway.app
```

---

### Option 2: Render (Full Stack)

#### Backend on Render:
1. Go to https://render.com
2. New → Web Service
3. Connect GitHub repository
4. Root directory: `backend`
5. Build command: `pip install -r requirements.txt`
6. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
7. Add environment variables (API keys)
8. Deploy!

#### Frontend on Render:
1. New → Static Site
2. Root directory: `Carrier-Copilot-new/frontend`
3. Build command: `npm install && npm run build`
4. Publish directory: `dist`
5. Deploy!

---

### Option 3: Docker Deployment

#### Create Dockerfile for Backend:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Create Dockerfile for Frontend:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose:
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - GROQ_API_KEY=${GROQ_API_KEY}
    volumes:
      - ./backend:/app

  frontend:
    build: ./Carrier-Copilot-new/frontend
    ports:
      - "80:80"
    depends_on:
      - backend
```

---

## 🔧 Production Configuration

### Backend Changes:
1. Update CORS origins in `backend/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-domain.com"],  # Update this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

2. Use production database (PostgreSQL recommended):
```python
# Instead of SQLite
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:pass@host/db")
```

### Frontend Changes:
1. Create `.env.production` in frontend:
```env
VITE_API_URL=https://your-backend-domain.com
```

2. Update API calls to use environment variable:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
axios.post(`${API_URL}/api/endpoint`, data);
```

---

## 📊 Database Migration

### For Production:
1. Use PostgreSQL instead of SQLite
2. Run migrations:
```bash
python backend/migrate_db.py
python backend/migrate_progress.py
python backend/migrate_roadmap_tracking.py
```

---

## 🧪 Testing Before Deployment

### Backend Tests:
```bash
cd backend
python -m pytest
```

### Frontend Tests:
```bash
cd Carrier-Copilot-new/frontend
npm run test
```

### Manual Testing Checklist:
- [ ] User signup/login works
- [ ] Resume upload and analysis works
- [ ] Skill gap analysis generates correctly
- [ ] Roadmap generation works
- [ ] Daily progress tracking works
- [ ] AI coach responds correctly
- [ ] All API endpoints return proper responses
- [ ] Dark mode toggle works
- [ ] Mobile responsive design works

---

## 🔒 Security Best Practices

1. **Never commit:**
   - `.env` files
   - Database files
   - API keys
   - User data

2. **Use environment variables** for all sensitive data

3. **Enable HTTPS** in production

4. **Set up rate limiting** on API endpoints

5. **Implement proper authentication** (JWT tokens)

6. **Regular security updates** for dependencies

---

## 📈 Monitoring & Maintenance

### Recommended Tools:
- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **Google Analytics** - Usage analytics
- **Uptime Robot** - Uptime monitoring

### Regular Maintenance:
- Update dependencies monthly
- Monitor API usage and costs
- Backup database regularly
- Check error logs weekly

---

## 🆘 Troubleshooting

### Common Issues:

**1. CORS Errors:**
- Update `allow_origins` in backend CORS middleware
- Ensure frontend URL is whitelisted

**2. Database Connection Failed:**
- Check DATABASE_URL environment variable
- Verify database is running
- Run migrations

**3. API Keys Not Working:**
- Verify keys are set in environment variables
- Check key permissions and quotas
- Test with Postman/curl

**4. Build Failures:**
- Clear node_modules and reinstall
- Check Node.js version (18+ required)
- Verify all dependencies are in package.json

---

## 📞 Support

For deployment issues:
1. Check logs in deployment platform
2. Verify environment variables are set
3. Test API endpoints with Postman
4. Check database connections

---

## ✅ Final Checklist Before Going Live

- [ ] All API keys are in environment variables (not hardcoded)
- [ ] .gitignore is properly configured
- [ ] Database files are excluded from git
- [ ] CORS is configured for production domain
- [ ] Frontend API URL points to production backend
- [ ] All features tested in production environment
- [ ] Error monitoring is set up
- [ ] Backup strategy is in place
- [ ] Documentation is up to date

---

**🎉 Ready to Deploy!**

Your GenAI Career Copilot is production-ready. Good luck with your deployment!
