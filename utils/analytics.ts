// import { LogEvent } from "expo-analytics";

const analytics = {
  logEvent: (eventName: string, params?: Record<string, any>) => {
    if (__DEV__) {
      console.log(`[Analytics] ${eventName}`, params);
    } else {
      // LogEvent(eventName, params);
      console.log(`[Analytics] ${eventName}`, params);
    }
  },
};

export default analytics;
