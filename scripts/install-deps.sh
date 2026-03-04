#!/bin/bash
set -e

cd /vercel/share/v0-project

# Clear npm cache to prevent stale data
npm cache clean --force

# Install dependencies fresh
npm install

echo "Dependencies installed successfully"
