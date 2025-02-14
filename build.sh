#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Updating package list..."
apt-get update

echo "Installing required dependencies..."
apt-get install -y wget unzip

echo "Downloading and installing Google Chrome..."
wget -qO google-chrome.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
apt-get install -y ./google-chrome.deb

echo "Verifying Chrome installation..."
google-chrome --version || { echo "Chrome installation failed!"; exit 1; }

echo "Installing project dependencies..."
npm install

echo "Installing Puppeteer Chrome browser..."
npx puppeteer browsers install chrome

echo "Build script completed successfully!"