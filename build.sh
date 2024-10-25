#!/bin/bash
# Build script for serving static React files via Flask

# Build react app
cd frontend
npm install
npm run build

# Move built files to backend directory
cd ..
rm -rf backend/frontend/build
mkdir -p backend/frontend
cp -r frontend/build backend/frontend/