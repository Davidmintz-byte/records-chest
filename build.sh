#!/bin/bash
# Build script for serving static React files via Flask

echo "Current directory: $PWD"

# Build react app
cd frontend
npm install
npm run build

# Create target directory relative to the backend
cd ..
TARGET_DIR="backend/frontend"
echo "Creating directory: $TARGET_DIR"
mkdir -p $TARGET_DIR

# Copy build files
echo "Copying build files to: $TARGET_DIR"
cp -r frontend/build $TARGET_DIR/

# Install backend dependencies
cd backend
pip install -r requirements.txt

# List contents to verify
echo "Contents of frontend/build:"
ls -la frontend/build