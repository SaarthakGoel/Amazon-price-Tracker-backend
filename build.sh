#!/bin/bash

# Install Chrome dependencies
apt-get update && apt-get install -y wget unzip

# Download & Install latest Chrome
wget -qO- https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb > google-chrome.deb
apt-get install -y ./google-chrome.deb

# Verify Chrome installation
google-chrome --version

# Install project dependencies
npm install