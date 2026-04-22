# 🚀 GenAI Career Copilot

An AI-powered career guidance platform that analyzes your resume, identifies skill gaps, and creates personalized learning roadmaps to help you achieve your career goals.

![Python](https://img.shields.io/badge/Python-3.11-blue)
![React](https://img.shields.io/badge/React-18-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

### 🎯 Core Features
- **AI Resume Analyzer** - Upload resume (PDF/DOCX/TXT) and extract skills automatically using LLM
- **Skill Gap Analysis** - Compare your skills with target role requirements
- **Personalized Roadmap** - Get week-by-week learning path with real resources
- **Custom Job Description** - Upload any JD and get tailored analysis
- **Multi-LLM Support** - Automatic fallback: Gemini → OpenAI → Groq → Rule-based

### 💡 Advanced Features
- **Real Resources** - YouTube courses, GitHub projects, official docs, practice platforms
- **Skill Intelligence** - Salary data, market demand, difficulty ratings, learning time
- **Role Intelligence** - Top companies, growth potential, job openings
- **Data Persistence** - Database + localStorage for seamless experience
- **Sequential Flow** - Guided step-by-step journey with progress tracking
- **Dark Mode** - Beautiful UI with dark/light theme

## 🏗️ Architecture

```
Frontend (React + Vite)
    ↓ REST API
Backend (FastAPI)
    ↓
├─ Multi-LLM Service (Gemini/OpenAI/Groq)
├─ RAG Pipeline (ChromaDB + Embeddings)
├─ Resource Engine (YouTube, GitHub, Docs)
├─ Skill Intelligence (Salary, Demand, Difficulty)
└─ Fallback Analyzer (Rule-based, always works)
```

## 🛠️ Tech Stack

### Frontend
- React 18 with Vite
- Tailwind CSS 3.3
- Framer Motion (animations)
- Axios (API calls)

### Backend
- FastAPI (Python web framework)
- SQLAlchemy (ORM)
- SQLite (database)
- Passlib + bcrypt (authentication)

### AI/ML
- Google Gemini API (primary LLM)
- OpenAI GPT-4 (secondary LLM)
- Groq Llama 3.3 (tertiary LLM)
- ChromaDB (vector database)
- Sentence Transformers (embeddings)
- RAG (Retrieval Augmented Generation)

## 📦 Installation

### Prerequisites
- Python 3.11+
- Node.js 18+
- Git

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/genai-career-copilot.git
cd genai-career-copilot
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
copy .env.example .env
# Edit .env and add your API keys

# Run database migration
python migrate_db.py

# Start backend
python main.py
```

Backend will run on: http://localhost:8000

### 3. Frontend Setup
```bash
cd Carrier-Copilot-new/frontend

# Install dependencies
npm install

# Start frontend
npm run dev
```

Frontend will run on: http://localhost:5173

## 🔑 API Keys Setup

The system supports multiple LLM providers with automatic fallback:

### Option 1: Gemini Only (Free)
```env
GEMINI_API_KEY=your_key_here
```
Get key: https://makersuite.google.com/app/apikey

### Option 2: Gemini + Groq (Both Free - Recommended)
```env
GEMINI_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key
```
Get Groq key: https://console.groq.com/keys

### Option 3: All Three (Maximum Reliability)
```env
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key
GROQ_API_KEY=your_groq_key
```
Get OpenAI key: https://platform.openai.com/api-keys

See [API_KEYS_SETUP.md](API_KEYS_SETUP.md) for detailed instructions.

## 🚀 Quick Start

### Using Batch Files (Windows)
```bash
# Start backend
start-backend.bat

# Start frontend (in new terminal)
start-frontend.bat
```

### Using Shell Scripts (Linux/Mac)
```bash
# Start backend
./start-backend.sh

# Start frontend (in new terminal)
./start-frontend.sh
```

### Manual Start
```bash
# Terminal 1 - Backend
cd backend
venv\Scripts\activate  # or source venv/bin/activate
python main.py

# Terminal 2 - Frontend
cd Carrier-Copilot-new/frontend
npm run dev
```

## 📖 Usage

1. **Sign Up / Login** - Create account or login
2. **Upload Resume** - Upload your resume (PDF/DOCX/TXT)
3. **Skill Gap Analysis** - Enter target role or upload job description
4. **View Results** - See matching/missing skills, completion percentage
5. **Get Roadmap** - Receive personalized learning path with resources

## 🎯 Supported Roles

The system provides accurate analysis for 15+ roles:
- Frontend Developer
- Backend Developer
- Full Stack Developer
- AI Engineer
- ML Engineer
- Data Scientist
- Data Analyst
- DevOps Engineer
- Cloud Engineer
- Mobile Developer
- Blockchain Developer
- And more...

## 📊 What You Get

### Skill Gap Analysis
- Required skills for role
- Your matching skills
- Missing skills (prioritized)
- Completion percentage
- Role level (entry/mid/senior)
- Top 3 strengths
- Focus areas
- Time estimate

### Role Intelligence
- Salary range (INR LPA)
- Market demand
- Difficulty level
- Growth potential
- Job openings estimate
- Top hiring companies

### Learning Roadmap
- Beginner → Intermediate → Advanced levels
- Week-by-week breakdown
- Real YouTube courses
- GitHub project ideas
- Official documentation
- Practice platforms (LeetCode, Kaggle, etc.)
- Key concepts to master
- Portfolio projects

## 🔧 Configuration

### Backend Configuration
Edit `backend/.env`:
```env
GEMINI_API_KEY=your_key
OPENAI_API_KEY=your_key  # optional
GROQ_API_KEY=your_key    # optional
```

### Frontend Configuration
Edit `Carrier-Copilot-new/frontend/vite.config.js` if needed.

## 📁 Project Structure

```
genai-career-copilot/
├── backend/
│   ├── database/          # Database models
│   ├── models/            # SQLAlchemy models
│   ├── routes/            # API endpoints
│   ├── services/          # Business logic
│   │   ├── rag_service.py
│   │   ├── resource_engine.py
│   │   ├── skill_intelligence.py
│   │   └── fallback_analyzer.py
│   ├── utils/             # Utilities
│   │   ├── multi_llm.py   # Multi-LLM support
│   │   └── gemini_llm.py
│   ├── rag/               # RAG pipeline
│   └── main.py            # FastAPI app
├── Carrier-Copilot-new/
│   └── frontend/
│       └── src/
│           ├── components/
│           ├── pages/
│           └── App.jsx
├── API_KEYS_SETUP.md      # API keys guide
├── IDEAL_STUDENT_FLOW.md  # User flow documentation
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Google Gemini for AI capabilities
- OpenAI for GPT models
- Groq for fast inference
- ChromaDB for vector storage
- Hugging Face for embeddings

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ using GenAI technologies**

**Status**: Production Ready ✅
**Last Updated**: April 2026
