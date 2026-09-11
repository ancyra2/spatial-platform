import { Capacitor } from '@capacitor/core';

// Platform detection stays here; Angular business code must remain platform agnostic.
export function isNativeRuntime(): boolean {
  return Capacitor.isNativePlatform();
}
