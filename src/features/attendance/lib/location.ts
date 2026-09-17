import * as Location from "expo-location";

export type LocationErrorCode = "PERMISSION_DENIED" | "UNAVAILABLE";

export class LocationError extends Error {
  code: LocationErrorCode;

  constructor(code: LocationErrorCode, message: string) {
    super(message);
    this.name = "LocationError";
    this.code = code;
  }
}

export type Coords = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
};

/** Requests foreground location permission and reads a fresh fix for check-in/out. */
export async function getCurrentCoords(): Promise<Coords> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    throw new LocationError(
      "PERMISSION_DENIED",
      "Location permission is required to check in or out."
    );
  }

  try {
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy ?? null,
    };
  } catch {
    throw new LocationError(
      "UNAVAILABLE",
      "Could not get your location. Check GPS/location services and try again."
    );
  }
}
