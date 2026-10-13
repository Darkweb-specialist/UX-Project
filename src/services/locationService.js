import * as Location from 'expo-location';

// Default central city coordinates (Bangalore Center) for fallback
export const DEFAULT_COORDS = {
  latitude: 12.9716,
  longitude: 77.5946,
  address: 'MG Road, Bangalore, Karnataka',
};

// Calculate distance between two coordinates using the Haversine formula (km)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;

  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // 1 decimal place e.g. 2.4 km
};

export const locationService = {
  // Request location permission and get current coordinates
  async getCurrentLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        return {
          granted: false,
          coords: DEFAULT_COORDS,
          message: 'Location permission was denied. Using manual/default location.',
        };
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        granted: true,
        coords: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        message: 'Location obtained successfully.',
      };
    } catch (error) {
      console.warn('Error fetching location with expo-location:', error);
      return {
        granted: false,
        coords: DEFAULT_COORDS,
        message: 'Could not access device GPS. Default location enabled.',
      };
    }
  },

  // Reverse geocode coordinates into a readable address
  async reverseGeocode(latitude, longitude) {
    try {
      const results = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (results && results.length > 0) {
        const item = results[0];
        const parts = [item.name, item.street, item.subregion || item.city, item.region].filter(Boolean);
        return parts.join(', ');
      }
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    } catch (e) {
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }
  },
};

export default locationService;
