import { Platform } from "react-native";

/**
 * Android emulator maps host loopback to 10.0.2.2; iOS simulator and web
 * can reach the host directly via localhost. Physical devices must set
 * EXPO_PUBLIC_API_BASE_URL to the dev machine's LAN IP.
 */
function defaultApiBaseUrl(): string {
  return Platform.select({
    android: "http://10.0.2.2:3000",
    default: "http://localhost:3000",
  });
}

export function getApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (fromEnv && fromEnv.trim().length > 0) {
    return fromEnv.trim().replace(/\/$/, "");
  }
  return defaultApiBaseUrl();
}
