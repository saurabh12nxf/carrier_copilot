# 🔧 Render Deployment Fix

## Problem
You're getting this error on Render:
```
error: metadata-generation-failed
× Encountered error while generating package metadata.
╰─> pydantic-core
```

This happens because:
1. Render is using Python 3.14.3 (too new, unstable)
2. pydantic-core requires Rust compilation which fails on Render's read-only filesystem

## ✅ Solution

### Step 1: Update Files in Your Repository

I've already created these files for you:

1. **`backend/runtime.txt`** - Specifies Python 3.11.7
2. **`.python-version`** - Alternative Python version specification
3. **`render.yaml`** - Render configuration
4. **`backend/Procfile`** - Process file for deployment
5. **Updated `backend/requirements.txt`** - Compatible dependency versions

### Step 2: Push to GitHub

```bash
git add .
git commit -m "fix: Add Render deployment configuration"
git push origin main
```

### Step 3: Configure Render

#### Option A: Using render.yaml (Automatic)
1. Go to https://render.com
2. Click "New" → "Blueprint"
3. Connect your GitHub repository
4. Render will automatically detect `render.yaml`
5. Add environment variables:
   - `GEMINI_API_KEY` = your_key
   - `OPENAI_API_KEY` = your_key (optional)
   - `GROQ_API_KEY` = your_key (optional)
6. Click "Apply"

#### Option B: Manual Setup
1. Go to https://render.com
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `career-copilot-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Python Version**: `3.11.7` (IMPORTANT!)
   - **Build Command**: 
     ```bash
     pip install --upgrade pip && pip install -r requirements.txt
     ```
   - **Start Command**: 
     ```bash
     uvicorn main:app --host 0.0.0.0 --port $PORT
     ```
5. Add Environment Variables:
   - `GEMINI_API_KEY`
   - `OPENAI_API_KEY` (optional)
   - `GROQ_API_KEY` (optional)
6. Click "Create Web Service"

### Step 4: Deploy Frontend

1. In Render, click "New" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `career-copilot-frontend`
   - **Root Directory**: `Carrier-Copilot-new/frontend`
   - **Build Command**: 
     ```bash
     npm install && npm run build
     ```
   - **Publish Directory**: `dist`
4. Add Environment Variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-backend-name.onrender.com` (use your actual backend URL)
5. Click "Create Static Site"

### Step 5: Update Frontend API Calls

After backend deploys, you'll get a URL like: `https://career-copilot-backend.onrender.com`

Update your frontend to use this URL:

1. Create `Carrier-Copilot-new/frontend/.env.production`:
```env
VITE_API_URL=https://your-backend-name.onrender.com
```

2. Update API calls in frontend to use environment variable:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Use API_URL in all axios calls
axios.post(`${API_URL}/api/endpoint`, data);
```

3. Push changes and redeploy

## 🎯 Quick Checklist

- [ ] `backend/runtime.txt` exists with `python-3.11.7`
- [ ] `.python-version` exists with `3.11.7`
- [ ] `render.yaml` exists in root
- [ ] `backend/requirements.txt` updated with compatible versions
- [ ] Pushed all changes to GitHub
- [ ] Created backend service on Render with Python 3.11.7
- [ ] Added environment variables (API keys)
- [ ] Created frontend static site on Render
- [ ] Updated frontend to use backend URL
- [ ] Both services deployed successfully

## 🔍 Troubleshooting

### Still getting Python 3.14 error?
1. In Render dashboard, go to your service
2. Click "Settings"
3. Scroll to "Python Version"
4. Manually select "3.11.7"
5. Click "Save Changes"
6. Trigger manual deploy

### Build still failing?
1. Check Render logs for specific error
2. Verify `runtime.txt` is in `backend/` folder
3. Try clearing Render's build cache:
   - Settings → "Clear build cache & deploy"

### Dependencies not installing?
1. Update pip first in build command:
   ```bash
   pip install --upgrade pip && pip install -r requirements.txt
   ```

### Frontend can't connect to backend?
1. Check CORS settings in `backend/main.py`:
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["https://your-frontend.onrender.com"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```
2. Verify `VITE_API_URL` environment variable is set
3. Check browser console for CORS errors

## 📞 Need Help?

If deployment still fails:
1. Check Render logs (click on your service → "Logs")
2. Copy the error message
3. Search for the error on Render's documentation
4. Check if all environment variables are set correctly

## ✅ Success!

Once deployed, your app will be live at:
- Backend: `https://career-copilot-backend.onrender.com`
- Frontend: `https://career-copilot-frontend.onrender.com`

Test all features:
- [ ] User signup/login
- [ ] Resume upload
- [ ] Skill gap analysis
- [ ] Roadmap generation
- [ ] Daily progress tracking
- [ ] AI coach

---

**Note**: Render free tier may have cold starts (takes 30-60 seconds to wake up after inactivity). Consider upgrading to paid tier for production use.
