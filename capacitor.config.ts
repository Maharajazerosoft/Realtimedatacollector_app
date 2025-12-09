import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'RealTimeDataCollector',
  webDir: 'www',
  plugins: {
    StatusBar: {
      style: 'Dark', // or 'Light'
      overlaysWebView: false, // Important: set to false
      backgroundColor: '#1ac1ee'
    }
  }
};

export default config;
