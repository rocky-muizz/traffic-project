#!/usr/bin/env bash
echo "========================================================="
echo "  SmartFlow AI: Traffic Signal Control System"
echo "========================================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed!"
    echo "Please download and install Node.js (LTS version) from: https://nodejs.org/"
    exit 1
fi

echo "[1/3] Node.js version:"
node -v
echo ""

# Install dependencies if node_modules does not exist
if [ ! -d "node_modules" ]; then
    echo "[2/3] Installing dependencies (~150MB)..."
    npm install --no-audit --no-fund
    if [ $? -ne 0 ]; then
        echo "[ERROR] npm install failed. Please check your disk space and internet connection."
        exit 1
    fi
else
    echo "[2/3] Dependencies already installed."
fi

echo ""
echo "========================================================="
echo "  SELECT DEMO MODE:"
echo "========================================================="
echo "  1. Full Graphical Web Demo (Browser: http://localhost:3000) [Default]"
echo "  2. Terminal Live Code Demo (Runs directly inside this terminal)"
echo "========================================================="
read -p "Enter 1 or 2 (Press Enter for 1): " DEMO_CHOICE

if [ "$DEMO_CHOICE" = "2" ]; then
    echo ""
    echo "Launching Terminal Live Code Demo..."
    node demo.js
    exit 0
fi

echo ""
echo "[3/3] Starting server on http://localhost:3000 ..."
echo "========================================================="
echo "Open your browser at: http://localhost:3000"
echo "Press Ctrl + C in this terminal to stop."
echo "========================================================="
echo ""

npm run dev
