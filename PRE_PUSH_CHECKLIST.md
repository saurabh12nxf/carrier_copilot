# ✅ Pre-Push Checklist

## 🚨 CRITICAL - Verify These Before Pushing

### 1. Environment Files
- [ ] `backend/.env` is NOT in git (should be in .gitignore)
- [ ] `backend/.env.example` exists with placeholder values
- [ ] No API keys are hardcoded in any `.py` or `.jsx` files

### 2. Database Files
- [ ] `backend/career_copilot.db` is NOT in git
- [ ] `backend/chroma_db/` folder is NOT in git
- [ ] `*.db` and `*.sqlite` files are in .gitignore

### 3. Dependencies
- [ ] `backend/venv/` is NOT in git
- [ ] `Carrier-Copilot-new/frontend/node_modules/` is NOT in git
- [ ] `requirements.txt` is up to date
- [ ] `package.json` is up to date

### 4. Temporary Files
- [ ] No `__pycache__/` folders in git
- [ ] No `.pyc` files in git
- [ ] No migration scripts (`migrate_*.py`, `add_column.py`) in git
- [ ] No `.log` files in git

### 5. Security
- [ ] No passwords or secrets in code
- [ ] No user data in repository
- [ ] `.gitignore` is properly configured

## 🔍 Quick Verification Commands

### Check for sensitive files:
```bash
# Check if .env is tracked
git ls-files | grep "\.env$"
# Should return nothing (except .env.example)

# Check for database files
git ls-files | grep "\.db$"
# Should return nothing

# Check for API keys in code
git grep -i "api_key.*=" -- "*.py" "*.jsx"
# Should only show environment variable references
```

### Check .gitignore is working:
```bash
git status --ignored
# Should show ignored files like venv/, node_modules/, *.db
```

## 📋 Files That SHOULD Be Pushed

### Root Directory:
- ✅ `.gitignore`
- ✅ `README.md`
- ✅ `DEPLOYMENT_GUIDE.md`
- ✅ `ADAPTIVE_ROADMAP_FEATURES.md`
- ✅ `IDEAL_STUDENT_FLOW.md`
- ✅ `start-backend.bat` / `start-backend.sh`
- ✅ `start-frontend.bat` / `start-frontend.sh`

### Backend:
- ✅ All `.py` source files
- ✅ `requirements.txt`
- ✅ `.env.example` (template only)
- ✅ All folders: `database/`, `models/`, `routes/`, `services/`, `utils/`, `rag/`

### Frontend:
- ✅ All `.jsx` source files
- ✅ `package.json`
- ✅ `vite.config.js`
- ✅ `tailwind.config.js`
- ✅ All folders: `src/`, `public/`

## 🚫 Files That MUST NOT Be Pushed

### Critical (Contains Secrets):
- ❌ `backend/.env`
- ❌ Any file with API keys

### User Data:
- ❌ `backend/career_copilot.db`
- ❌ `backend/chroma_db/`
- ❌ Any `*.db` or `*.sqlite` files

### Dependencies:
- ❌ `backend/venv/`
- ❌ `Carrier-Copilot-new/frontend/node_modules/`
- ❌ `backend/__pycache__/`

### Temporary:
- ❌ `*.log` files
- ❌ `*.pyc` files
- ❌ Migration scripts (`migrate_*.py`, `add_column.py`)
- ❌ Old security files (already deleted)

## 🧪 Final Tests Before Push

### 1. Backend Test:
```bash
cd backend
python -c "import main; print('✓ Backend imports work')"
```

### 2. Frontend Test:
```bash
cd Carrier-Copilot-new/frontend
npm run build
# Should build without errors
```

### 3. Check for Secrets:
```bash
# Search for potential secrets
git grep -i "sk-" -- "*.py" "*.jsx"
git grep -i "AIza" -- "*.py" "*.jsx"
# Should return nothing
```

## 📤 Ready to Push!

If all checks pass, you're ready to push:

```bash
git add .
git commit -m "feat: Add adaptive roadmap and project builder system"
git push origin main
```

## 🚀 After Pushing

1. **Verify on GitHub:**
   - Check that `.env` is NOT visible
   - Check that database files are NOT visible
   - Check that `node_modules/` and `venv/` are NOT visible

2. **Test Clone:**
   ```bash
   # In a different directory
   git clone your-repo-url test-clone
   cd test-clone
   # Verify .env is missing (expected)
   # Verify .env.example exists
   ```

3. **Deploy:**
   - Follow [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
   - Set environment variables in deployment platform
   - Test all features in production

## ⚠️ If You Accidentally Pushed Secrets

1. **Immediately revoke the API keys**
2. **Remove from git history:**
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch backend/.env" \
     --prune-empty --tag-name-filter cat -- --all
   
   git push origin --force --all
   ```
3. **Generate new API keys**
4. **Update .gitignore**

---

**✅ All checks passed? You're ready to deploy!**
