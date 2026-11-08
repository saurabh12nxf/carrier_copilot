#!/bin/bash
echo "Starting Career Copilot Frontend..."
cd Carrier-Copilot-new/frontend
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi
echo "Starting Vite development server..."
npm run dev
