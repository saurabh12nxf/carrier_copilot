@echo off
echo Starting Career Copilot Backend...
cd backend
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
    call venv\Scripts\activate
    echo Installing dependencies...
    pip install -r requirements.txt
) else (
    call venv\Scripts\activate
)
echo Starting FastAPI server at http://localhost:8000...
venv\Scripts\python.exe -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
