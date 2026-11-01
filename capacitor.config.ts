import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Nima — Android (Capacitor) configuration
 * ---------------------------------------------------------------
 * فقط یک خط را عوض کنید: آدرس سرور Nima روی کامپیوتر آزمایشگاه.
 * آدرس IP کامپیوتر را با دستور  ipconfig  در ویندوز پیدا کنید
 * (مثلاً 192.168.1.10). سرور باید روشن باشد:  npm start
 */
const config: CapacitorConfig = {
  appId: 'com.nima.lab',
  appName: 'Nima',
  webDir: 'public',
  server: {
    // ← آدرس سرور خودتان را اینجا بنویسید:
    url: 'http://192.168.1.10:3000',
    cleartext: true,
  },
};

export default config;
