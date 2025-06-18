#!/bin/bash

# Kill all running simulators
xcrun simctl shutdown all
killall Simulator

# Reset all simulators
xcrun simctl erase all

# Get the iPhone 15 Pro simulator ID
SIMULATOR_ID=$(xcrun simctl list devices | grep "iPhone 15 Pro" | grep -v "iPhone 15 Pro Max" | head -n 1 | sed -E 's/.*\(([A-Z0-9-]+)\).*/\1/')

if [ -z "$SIMULATOR_ID" ]; then
    echo "Error: Could not find iPhone 15 Pro simulator"
    exit 1
fi

# Boot the simulator
xcrun simctl boot "$SIMULATOR_ID"

# Open Simulator app
open -a Simulator

# Wait for simulator to be ready
sleep 5

echo "Simulator setup complete. Using iPhone 15 Pro with ID: $SIMULATOR_ID" 