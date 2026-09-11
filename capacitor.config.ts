import type { CapacitorConfig } from '@capacitor/cli';

// TODO(owner): choose the final application name, Android package ID and iOS bundle ID.
// Intentionally omit appId/appName. Do not add/sync native projects until identity is agreed.
const config: CapacitorConfig = { webDir: 'dist/apps/web/browser' };
export default config;
