#!/bin/bash
echo "Starting Career Copilot Backend..."
cd backend
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    echo "Installing dependencies..."
    pip install -r requirements.txt
else
    source venv/bin/activate
fi
echo "Starting FastAPI server at http://localhost:8000..."
venv/bin/python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
