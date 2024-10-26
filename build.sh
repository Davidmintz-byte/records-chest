#!/bin/bash
# Build script for serving static React files via Flask

echo "Current directory: $PWD"

# Build react app
cd frontend
npm install
npm run build

# Determine if we're in production (Render) or local
if [ "$RENDER" = "true" ]; then
    # We're on Render
    TARGET_DIR="/opt/render/project/src/backend/frontend"
else
    # We're local
    TARGET_DIR="../backend/frontend"
fi

echo "Creating directory: $TARGET_DIR"
mkdir -p $TARGET_DIR

# Copy build files
echo "Copying build files to: $TARGET_DIR"
cp -r build $TARGET_DIR/

# Install backend dependencies
cd ../backend
pip install -r requirements.txt

# List contents to verify
echo "Contents of frontend/build directory:"
ls -la frontend/build || ls -la $TARGET_DIR/build