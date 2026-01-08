import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: 'com.surveyapp.surveyform',
  appName: 'RealTimeDataCollector',
  webDir: 'www',
  plugins: {
    StatusBar: {
      style: "Dark",          
      overlaysWebView: false, 
      backgroundColor: "#1ac1ee"
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ffffff",
      androidScaleType: "CENTER_CROP",
      showSpinner: false
    },
    Keyboard: {
      resize: 'body'
    }
  }
};

export default config;
