#!/bin/bash
# Build script for serving static React files via Flask

# Build react app
cd frontend
npm install
npm run build

# Move built files to backend directory
rm -rf ../backend/frontend/build
mkdir -p ../backend/frontend
cp -r build ../backend/frontend/

# Install backend dependencies
cd ../backend
pip install -r requirements.txt