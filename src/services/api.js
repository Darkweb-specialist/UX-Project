import { Platform } from 'react-native';

// In Android emulator localhost is 10.0.2.2; in iOS simulator / web it is localhost.
const DEFAULT_API_HOST = Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';

let API_BASE_URL = `${DEFAULT_API_HOST}/api`;

export const setApiBaseUrl = (customUrl) => {
  if (customUrl) {
    API_BASE_URL = customUrl.endsWith('/') ? customUrl.slice(0, -1) : customUrl;
  }
};

export const getApiBaseUrl = () => API_BASE_URL;

// Helper with timeout to prevent app freezing when backend is down
const fetchWithTimeout = async (url, options = {}, timeoutMs = 2500) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options.headers || {}),
      },
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

export const apiService = {
  // Check backend server health
  async checkHealth() {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/health`, {}, 2000);
      if (res.ok) {
        const data = await res.json();
        return { isConnected: true, data };
      }
      return { isConnected: false, data: null };
    } catch (e) {
      return { isConnected: false, data: null, error: e.message };
    }
  },

  // Fetch all donations
  async getDonations() {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/donations`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return { success: true, data: json.data || json, fromBackend: true };
    } catch (error) {
      return { success: false, error: error.message, fromBackend: false };
    }
  },

  // Create a new donation
  async createDonation(donationData) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/donations`, {
        method: 'POST',
        body: JSON.stringify(donationData),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return { success: true, data: json.data || json, fromBackend: true };
    } catch (error) {
      return { success: false, error: error.message, fromBackend: false };
    }
  },

  // Request a pickup
  async createPickupRequest(pickupData) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/pickups`, {
        method: 'POST',
        body: JSON.stringify(pickupData),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return { success: true, data: json.data || json, fromBackend: true };
    } catch (error) {
      return { success: false, error: error.message, fromBackend: false };
    }
  },

  // Update pickup / donation status
  async updateStatus(id, newStatus, role = 'donor') {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/donations/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus, role }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return { success: true, data: json.data || json, fromBackend: true };
    } catch (error) {
      return { success: false, error: error.message, fromBackend: false };
    }
  },

  // Demonstrate public API retrieval via Fetch API (Requirement 7)
  async getFoodInspirationTip() {
    try {
      // Using a reliable public API for demonstration
      const res = await fetchWithTimeout('https://dummyjson.com/recipes?limit=1', {}, 3000);
      if (res.ok) {
        const json = await res.json();
        if (json.recipes && json.recipes.length > 0) {
          return {
            source: 'Public Recipes API (DummyJSON)',
            tip: `Healthy Recipe Idea: "${json.recipes[0].name}" with ${json.recipes[0].cuisine} spices. Surplus veggies can easily be turned into healthy stews!`,
          };
        }
      }
      return {
        source: 'Food Conservation Guideline',
        tip: 'Did you know? Donating 10 surplus meals saves approximately 25kg of CO2 equivalent emissions!',
      };
    } catch (e) {
      return {
        source: 'Food Conservation Guideline',
        tip: 'Did you know? Donating 10 surplus meals saves approximately 25kg of CO2 equivalent emissions!',
      };
    }
  },
};

export default apiService;
