import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.base6a5ee3e55b797137eb42e644.app',
  appName: 'Toggl',
  webDir: 'dist',
  server: {
    // These are Capacitor's defaults, pinned on purpose: the app's origin (capacitor://localhost)
    // scopes its localStorage, so changing either would hide the localStorage save copy.
    iosScheme: 'capacitor',
    hostname: 'localhost',
  },
  ios: {
    // Shown behind the web view until the game paints — matches the launch screen (no white flash).
    backgroundColor: '#1C2439',
  },
};

export default config;
