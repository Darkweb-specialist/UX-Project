import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import storage from '../storage/asyncStorage';
import apiService from '../services/api';
import locationService, { DEFAULT_COORDS } from '../services/locationService';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Global State
  const [role, setRole] = useState('receiver'); // 'donor' | 'receiver'
  const [profile, setProfile] = useState(null);
  const [donations, setDonations] = useState([]);
  const [pickups, setPickups] = useState([]);
  const [userLocation, setUserLocation] = useState({
    latitude: DEFAULT_COORDS.latitude,
    longitude: DEFAULT_COORDS.longitude,
    address: DEFAULT_COORDS.address,
    granted: false,
  });
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [backendUrl, setBackendUrlState] = useState(apiService.getApiBaseUrl ? apiService.getApiBaseUrl() : 'http://localhost:5000/api');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [inspirationTip, setInspirationTip] = useState(null);
  const [isOnboarded, setIsOnboarded] = useState(false);

  // Initialize app data from AsyncStorage on app launch
  const initializeApp = useCallback(async () => {
    try {
      setIsLoading(true);

      // Check onboarding
      const onboarded = await storage.getIsOnboarded();
      setIsOnboarded(onboarded);

      // 1. Load active role & profile
      const savedRole = await storage.getUserRole();
      setRole(savedRole);
      const savedProfile = await storage.getProfile(savedRole);
      setProfile(savedProfile);

      // 2. Load local donations & pickups
      const localDonations = await storage.getDonations();
      const localPickups = await storage.getPickups();
      setDonations(localDonations);
      setPickups(localPickups);

      // 3. Obtain device location with permission
      const locResult = await locationService.getCurrentLocation();
      setUserLocation({
        latitude: locResult.coords.latitude,
        longitude: locResult.coords.longitude,
        address: locResult.coords.address || 'Detected Location',
        granted: locResult.granted,
      });

      // 4. Check backend connectivity
      const health = await apiService.checkHealth();
      setIsBackendConnected(health.isConnected);

      if (health.isConnected) {
        // If live backend exists, sync donations
        const backendDonations = await apiService.getDonations();
        if (backendDonations.success && Array.isArray(backendDonations.data) && backendDonations.data.length > 0) {
          setDonations(backendDonations.data);
          await storage.saveDonations(backendDonations.data);
        }
      }

      // 5. Fetch public API sample data for demonstration
      const tip = await apiService.getFoodInspirationTip();
      setInspirationTip(tip);
    } catch (error) {
      console.warn('Initialization error in AppContext:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  // Switch role between 'donor' and 'receiver'
  const switchRole = async (newRole) => {
    try {
      setRole(newRole);
      await storage.saveUserRole(newRole);
      const newProf = await storage.getProfile(newRole);
      setProfile(newProf);
    } catch (e) {
      console.error('Error switching role:', e);
    }
  };

  // Update user profile
  const updateProfile = async (updatedData) => {
    try {
      const merged = { ...profile, ...updatedData };
      setProfile(merged);
      await storage.saveProfile(role, merged);
      return true;
    } catch (e) {
      console.error('Error updating profile:', e);
      return false;
    }
  };

  // Set manual user location (fallback for denied GPS)
  const setManualLocation = (newCoords, address) => {
    setUserLocation({
      latitude: parseFloat(newCoords.latitude),
      longitude: parseFloat(newCoords.longitude),
      address: address || `${newCoords.latitude}, ${newCoords.longitude}`,
      granted: false,
    });
  };

  // Add new food donation
  const addDonation = async (newDonation) => {
    try {
      const donationItem = {
        id: `don-${Date.now()}`,
        status: 'Available',
        createdAt: new Date().toISOString(),
        donorName: profile?.name || 'Anonymous Donor',
        donorPhone: profile?.phone || '+91 99999 00000',
        donorType: profile?.organization ? 'Organization' : 'Individual',
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        ...newDonation,
      };

      const updated = [donationItem, ...donations];
      setDonations(updated);
      await storage.saveDonations(updated);

      // Increment donor stats
      if (profile && role === 'donor') {
        const updatedProfile = {
          ...profile,
          donationsCount: (profile.donationsCount || 0) + 1,
        };
        setProfile(updatedProfile);
        await storage.saveProfile('donor', updatedProfile);
      }

      // If backend is active, also post to backend
      if (isBackendConnected) {
        apiService.createDonation(donationItem).catch((e) => console.log('Backend sync note:', e));
      }

      return { success: true, donation: donationItem };
    } catch (error) {
      console.error('Error adding donation:', error);
      return { success: false, error: error.message };
    }
  };

  // Request a pickup (Receiver flow)
  const requestPickup = async ({ donationId, notes, estimatedTime }) => {
    try {
      // Find the donation
      const donationIndex = donations.findIndex((d) => d.id === donationId);
      if (donationIndex === -1) {
        return { success: false, message: 'Donation not found.' };
      }

      const donation = donations[donationIndex];

      // Prevent duplicate requests: check if this receiver already requested this donation
      const alreadyRequested = pickups.some(
        (p) => p.donationId === donationId && p.receiverName === profile?.name && p.status !== 'Cancelled'
      );

      if (alreadyRequested) {
        return {
          success: false,
          message: 'You have already placed a pickup request for this item.',
        };
      }

      // Create new pickup record
      const pickupRequest = {
        id: `req-${Date.now()}`,
        donationId: donation.id,
        foodName: donation.foodName,
        quantity: `${donation.quantity} ${donation.unit}`,
        receiverName: profile?.name || 'Authorized Receiver',
        receiverPhone: profile?.phone || '+91 98765 00000',
        receiverRole: profile?.organization || 'NGO Volunteer',
        pickupTimeEstimated: estimatedTime || 'Within 2 hours',
        pickupAddress: donation.pickupAddress,
        notes: notes || 'Standard community food rescue pickup.',
        status: 'Requested',
        requestedAt: new Date().toISOString(),
      };

      // Update donation status to 'Requested'
      const updatedDonations = [...donations];
      updatedDonations[donationIndex] = {
        ...donation,
        status: 'Requested',
      };

      const updatedPickups = [pickupRequest, ...pickups];

      setDonations(updatedDonations);
      setPickups(updatedPickups);

      await storage.saveDonations(updatedDonations);
      await storage.savePickups(updatedPickups);

      // Sync with backend if connected
      if (isBackendConnected) {
        apiService.createPickupRequest(pickupRequest).catch((e) => console.log('Backend sync note:', e));
        apiService.updateStatus(donationId, 'Requested').catch((e) => console.log('Backend status note:', e));
      }

      return { success: true, pickup: pickupRequest };
    } catch (error) {
      console.error('Error requesting pickup:', error);
      return { success: false, message: error.message };
    }
  };

  // Update pickup status (Accept, Pick Up, Cancel)
  const updatePickupStatus = async (pickupId, donationId, newStatus) => {
    try {
      // 1. Update Pickups array
      const updatedPickups = pickups.map((req) => {
        if (req.id === pickupId) {
          return { ...req, status: newStatus };
        }
        return req;
      });

      // 2. Update Donations array corresponding status
      // If pickup is 'Cancelled', donation becomes 'Available' again!
      // If 'Accepted', donation becomes 'Accepted'
      // If 'Picked Up', donation becomes 'Picked Up'
      const donationStatus = newStatus === 'Cancelled' ? 'Available' : newStatus;

      const updatedDonations = donations.map((don) => {
        if (don.id === donationId) {
          return { ...don, status: donationStatus };
        }
        return don;
      });

      setPickups(updatedPickups);
      setDonations(updatedDonations);

      await storage.savePickups(updatedPickups);
      await storage.saveDonations(updatedDonations);

      // If receiver finished pickup, increment completed stats
      if (newStatus === 'Picked Up' && role === 'receiver' && profile) {
        const updatedProfile = {
          ...profile,
          pickupsCompleted: (profile.pickupsCompleted || 0) + 1,
        };
        setProfile(updatedProfile);
        await storage.saveProfile('receiver', updatedProfile);
      }

      // Sync backend
      if (isBackendConnected) {
        apiService.updateStatus(donationId, donationStatus, role).catch((e) => console.log('Backend sync note:', e));
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating pickup status:', error);
      return { success: false, error: error.message };
    }
  };

  // Pull-to-refresh
  const refreshData = async () => {
    try {
      setIsRefreshing(true);
      const health = await apiService.checkHealth();
      setIsBackendConnected(health.isConnected);

      const localDonations = await storage.getDonations();
      const localPickups = await storage.getPickups();
      setDonations(localDonations);
      setPickups(localPickups);

      const tip = await apiService.getFoodInspirationTip();
      setInspirationTip(tip);
    } catch (e) {
      console.warn('Refresh error:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Reset all data to clean initial sample data for demonstration
  const resetDemoData = async () => {
    try {
      setIsLoading(true);
      await storage.resetAllDemoData();
      const freshDonations = await storage.getDonations();
      const freshPickups = await storage.getPickups();
      const freshProfile = await storage.getProfile(role);
      setDonations(freshDonations);
      setPickups(freshPickups);
      setProfile(freshProfile);
      return true;
    } catch (e) {
      console.error('Reset error:', e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Complete onboarding
  const completeOnboarding = async (chosenRole) => {
    try {
      await storage.setOnboarded(true);
      setIsOnboarded(true);
      if (chosenRole) {
        await switchRole(chosenRole);
      }
    } catch (e) {
      console.error('Error completing onboarding:', e);
    }
  };

  return (
    <AppContext.Provider
      value={{
        role,
        profile,
        donations,
        pickups,
        userLocation,
        isBackendConnected,
        backendUrl,
        isLoading,
        isRefreshing,
        inspirationTip,
        isOnboarded,
        switchRole,
        updateProfile,
        setManualLocation,
        addDonation,
        requestPickup,
        updatePickupStatus,
        refreshData,
        resetDemoData,
        completeOnboarding,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
