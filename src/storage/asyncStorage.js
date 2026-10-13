import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SAMPLE_DONATIONS,
  SAMPLE_PICKUP_REQUESTS,
  DEFAULT_DONOR_PROFILE,
  DEFAULT_RECEIVER_PROFILE,
} from './sampleData';

const KEYS = {
  DONATIONS: '@smart_food_donations_v1',
  PICKUPS: '@smart_food_pickups_v1',
  USER_ROLE: '@smart_food_user_role_v1',
  DONOR_PROFILE: '@smart_food_donor_profile_v1',
  RECEIVER_PROFILE: '@smart_food_receiver_profile_v1',
  IS_ONBOARDED: '@smart_food_is_onboarded_v1',
};

export const storage = {
  // Load all donations (returns sample data if empty)
  async getDonations() {
    try {
      const data = await AsyncStorage.getItem(KEYS.DONATIONS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      // First run initialize
      await AsyncStorage.setItem(KEYS.DONATIONS, JSON.stringify(SAMPLE_DONATIONS));
      return SAMPLE_DONATIONS;
    } catch (e) {
      console.warn('AsyncStorage getDonations error, falling back to sample data:', e);
      return SAMPLE_DONATIONS;
    }
  },

  // Save full donations list
  async saveDonations(donations) {
    try {
      await AsyncStorage.setItem(KEYS.DONATIONS, JSON.stringify(donations));
      return true;
    } catch (e) {
      console.error('AsyncStorage saveDonations error:', e);
      return false;
    }
  },

  // Load pickup requests
  async getPickups() {
    try {
      const data = await AsyncStorage.getItem(KEYS.PICKUPS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
      await AsyncStorage.setItem(KEYS.PICKUPS, JSON.stringify(SAMPLE_PICKUP_REQUESTS));
      return SAMPLE_PICKUP_REQUESTS;
    } catch (e) {
      console.warn('AsyncStorage getPickups error:', e);
      return SAMPLE_PICKUP_REQUESTS;
    }
  },

  // Save pickup requests
  async savePickups(pickups) {
    try {
      await AsyncStorage.setItem(KEYS.PICKUPS, JSON.stringify(pickups));
      return true;
    } catch (e) {
      console.error('AsyncStorage savePickups error:', e);
      return false;
    }
  },

  // Get active role ('donor' | 'receiver')
  async getUserRole() {
    try {
      const role = await AsyncStorage.getItem(KEYS.USER_ROLE);
      return role || 'receiver'; // default to receiver so browsing is immediate
    } catch (e) {
      return 'receiver';
    }
  },

  // Set active role
  async saveUserRole(role) {
    try {
      await AsyncStorage.setItem(KEYS.USER_ROLE, role);
      return true;
    } catch (e) {
      return false;
    }
  },

  // Get user profile based on role
  async getProfile(role) {
    try {
      const key = role === 'donor' ? KEYS.DONOR_PROFILE : KEYS.RECEIVER_PROFILE;
      const data = await AsyncStorage.getItem(key);
      if (data) {
        return JSON.parse(data);
      }
      const defaultProf = role === 'donor' ? DEFAULT_DONOR_PROFILE : DEFAULT_RECEIVER_PROFILE;
      await AsyncStorage.setItem(key, JSON.stringify(defaultProf));
      return defaultProf;
    } catch (e) {
      return role === 'donor' ? DEFAULT_DONOR_PROFILE : DEFAULT_RECEIVER_PROFILE;
    }
  },

  // Save profile
  async saveProfile(role, profile) {
    try {
      const key = role === 'donor' ? KEYS.DONOR_PROFILE : KEYS.RECEIVER_PROFILE;
      await AsyncStorage.setItem(key, JSON.stringify(profile));
      return true;
    } catch (e) {
      console.error('AsyncStorage saveProfile error:', e);
      return false;
    }
  },

  // Check onboarding status
  async getIsOnboarded() {
    try {
      const val = await AsyncStorage.getItem(KEYS.IS_ONBOARDED);
      return val === 'true';
    } catch (e) {
      return false;
    }
  },

  // Set onboarding complete
  async setOnboarded(status = true) {
    try {
      await AsyncStorage.setItem(KEYS.IS_ONBOARDED, status ? 'true' : 'false');
      return true;
    } catch (e) {
      return false;
    }
  },

  // Demo Reset function: resets all data back to clean sample records
  async resetAllDemoData() {
    try {
      await AsyncStorage.setItem(KEYS.DONATIONS, JSON.stringify(SAMPLE_DONATIONS));
      await AsyncStorage.setItem(KEYS.PICKUPS, JSON.stringify(SAMPLE_PICKUP_REQUESTS));
      await AsyncStorage.setItem(KEYS.DONOR_PROFILE, JSON.stringify(DEFAULT_DONOR_PROFILE));
      await AsyncStorage.setItem(KEYS.RECEIVER_PROFILE, JSON.stringify(DEFAULT_RECEIVER_PROFILE));
      return true;
    } catch (e) {
      console.error('Reset demo data failed:', e);
      return false;
    }
  },
};

export default storage;
