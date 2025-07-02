// Development Configuration
//
// To fix the "Network request failed" error, you need to set the correct API URL
// based on your development environment:
//
// 1. For iOS Simulator (running on same machine as your API server):
//    - Use: http://localhost:8888/api
//
// 2. For Android Emulator:
//    - Use: http://10.0.2.2:8888/api
//
// 3. For Physical Device:
//    - Find your computer's IP address:
//      - macOS/Linux: run 'ifconfig' in terminal
//      - Windows: run 'ipconfig' in command prompt
//    - Use: http://YOUR_COMPUTER_IP:8888/api
//      Example: http://192.168.1.100:8888/api
//
// To set the API URL, create a .env file in the root directory with:
// EXPO_PUBLIC_BASE_URL=http://YOUR_IP:8888/api
//
// Or set it as an environment variable before running the app:
// EXPO_PUBLIC_BASE_URL=http://YOUR_IP:8888/api npx expo start

export const DEV_CONFIG = {
  // Set this to your computer's IP address when testing on physical devices
  COMPUTER_IP: "192.168.1.100", // Replace with your actual IP

  // Common development URLs
  LOCALHOST: "http://localhost:8888/api",
  ANDROID_EMULATOR: "http://10.0.2.2:8888/api",

  // Helper function to get the correct URL
  getApiUrl: (ip?: string) => {
    if (ip) {
      return `http://${ip}:8888/api`;
    }
    return process.env.EXPO_PUBLIC_BASE_URL || "http://localhost:8888/api";
  },
};
