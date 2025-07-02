#!/bin/bash

# Setup API URL for React Native development
# This script helps you find your computer's IP address and set up the API URL

echo "🔧 Setting up API URL for React Native development"
echo ""

# Detect OS and get IP address
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    echo "📱 Detected macOS"
    IP_ADDRESS=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1)
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    echo "🐧 Detected Linux"
    IP_ADDRESS=$(hostname -I | awk '{print $1}')
else
    # Windows or other
    echo "🪟 Detected Windows or other OS"
    echo "Please run 'ipconfig' and look for your IPv4 address"
    exit 1
fi

echo "📍 Your computer's IP address: $IP_ADDRESS"
echo ""

# Show different configurations
echo "🌐 API URL configurations:"
echo "   iOS Simulator (same machine): http://localhost:8888/api"
echo "   Android Emulator: http://10.0.2.2:8888/api"
echo "   Physical Device: http://$IP_ADDRESS:8888/api"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# API Configuration
# Set this to your computer's IP address when testing on physical devices
EXPO_PUBLIC_BASE_URL=http://$IP_ADDRESS:8888/api

# Alternative configurations:
# For iOS Simulator (if running on same machine):
# EXPO_PUBLIC_BASE_URL=http://localhost:8888/api
# 
# For Android Emulator:
# EXPO_PUBLIC_BASE_URL=http://10.0.2.2:8888/api
EOF
    echo "✅ Created .env file with IP address: $IP_ADDRESS"
else
    echo "⚠️  .env file already exists. Please update it manually with:"
    echo "   EXPO_PUBLIC_BASE_URL=http://$IP_ADDRESS:8888/api"
fi

echo ""
echo "🚀 To start the app with the correct API URL:"
echo "   npx expo start"
echo ""
echo "🔍 If you're still getting network errors:"
echo "   1. Make sure your API server is running on port 8888"
echo "   2. Check that your device/simulator can reach your computer"
echo "   3. Try using localhost for iOS Simulator"
echo "   4. Try using 10.0.2.2 for Android Emulator" 