import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Pressable,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import Header from '../components/Header';
import MapViewComponent from '../components/MapViewComponent';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import DonationCard from '../components/DonationCard';
import { useApp } from '../context/AppContext';
import { calculateDistance } from '../services/locationService';
import locationService from '../services/locationService';

const LANDMARKS = [
  { name: 'MG Road (Central Bangalore)', lat: 12.9716, lng: 77.5946 },
  { name: 'Indiranagar 100ft Road', lat: 12.9784, lng: 77.6408 },
  { name: 'Koramangala 5th Block', lat: 12.9352, lng: 77.6245 },
  { name: 'Church Street', lat: 12.9750, lng: 77.6050 },
  { name: 'Airport Road / Domlur', lat: 12.9592, lng: 77.6612 },
];

export const NearbyScreen = ({ navigation }) => {
  const { userLocation, donations, setManualLocation } = useApp();

  const [maxRadiusKm, setMaxRadiusKm] = useState(15); // 5, 10, 15, 50
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [manualAddressInput, setManualAddressInput] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  // Compute distance for each donation and sort ascending
  const nearbyDonations = useMemo(() => {
    return donations
      .map((item) => {
        const dist =
          item.latitude && item.longitude && userLocation
            ? calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                item.latitude,
                item.longitude
              )
            : 999;
        return { ...item, distanceKm: dist };
      })
      .filter((item) => maxRadiusKm === 'All' || item.distanceKm <= maxRadiusKm)
      .sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999));
  }, [donations, userLocation, maxRadiusKm]);

  // Request GPS again
  const handleRefreshGPS = async () => {
    try {
      setIsLocating(true);
      const res = await locationService.getCurrentLocation();
      if (res.granted) {
        setManualLocation(res.coords, res.coords.address || 'Current Device GPS Location');
        Alert.alert('Location Updated', 'Your device GPS coordinates were retrieved successfully.');
      } else {
        Alert.alert('GPS Permission', 'Location access is denied. You can choose a landmark below.');
      }
    } catch (e) {
      Alert.alert('Notice', 'Unable to fetch GPS. Default location maintained.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleSelectLandmark = (landmark) => {
    setManualLocation(
      { latitude: landmark.lat, longitude: landmark.lng },
      landmark.name
    );
    setShowLocationModal(false);
  };

  const handleCustomAddressSubmit = () => {
    if (!manualAddressInput.trim()) return;
    // Simulate geocoding to slight offset around central coords
    const pseudoLat = 12.9716 + (Math.random() - 0.5) * 0.04;
    const pseudoLng = 77.5946 + (Math.random() - 0.5) * 0.04;
    setManualLocation(
      { latitude: pseudoLat, longitude: pseudoLng },
      manualAddressInput.trim()
    );
    setManualAddressInput('');
    setShowLocationModal(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Nearby Food Rescues" />

      <FlatList
        data={nearbyDonations}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <DonationCard
            item={item}
            index={index}
            userLocation={userLocation}
            onPress={() => navigation.navigate('DonationDetails', { donationId: item.id })}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            {/* Permission / Location Banner */}
            {!userLocation.granted && (
              <View style={styles.permissionWarning}>
                <Ionicons name="location-outline" size={18} color={colors.warning} />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.permissionWarningTitle}>Simulated / Manual Location</Text>
                  <Text style={styles.permissionWarningText}>
                    GPS permission not active. Using manual coordinates for testing nearby food rescue routes.
                  </Text>
                </View>
                <Pressable onPress={handleRefreshGPS} style={styles.retryGpsBtn}>
                  <Text style={styles.retryGpsBtnText}>Retry GPS</Text>
                </Pressable>
              </View>
            )}

            {/* Interactive Coordinate Map Component */}
            <MapViewComponent
              userLocation={userLocation}
              donations={donations}
              onSelectDonation={(item) =>
                navigation.navigate('DonationDetails', { donationId: item.id })
              }
              onOpenManualEntry={() => setShowLocationModal(true)}
            />

            {/* Radius Filters */}
            <View style={styles.radiusRow}>
              <Text style={styles.radiusLabel}>Distance Filter:</Text>
              <View style={styles.radiusChips}>
                {[5, 10, 15, 'All'].map((radius) => {
                  const isSelected = maxRadiusKm === radius;
                  return (
                    <Pressable
                      key={String(radius)}
                      onPress={() => setMaxRadiusKm(radius)}
                      style={[
                        styles.radiusChip,
                        isSelected && styles.radiusChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.radiusChipText,
                          isSelected && styles.radiusChipTextActive,
                        ]}
                      >
                        {radius === 'All' ? 'All' : `${radius} km`}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Header info */}
            <View style={styles.nearbyHeaderRow}>
              <Text style={styles.nearbyTitle}>
                {nearbyDonations.length} Available Within {maxRadiusKm === 'All' ? 'Any Distance' : `${maxRadiusKm} km`}
              </Text>
              <Pressable
                onPress={() => setShowLocationModal(true)}
                style={styles.changeLocBtn}
              >
                <Ionicons name="pencil" size={12} color={colors.primary} />
                <Text style={styles.changeLocBtnText}>Change City Area</Text>
              </Pressable>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="navigate-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No Donations In This Radius</Text>
            <Text style={styles.emptySubtitle}>
              Try expanding your distance filter to 15 km or 'All' to see all available surplus food items.
            </Text>
            <CustomButton
              title="Show All Distances"
              onPress={() => setMaxRadiusKm('All')}
              size="small"
              style={{ marginTop: 12 }}
            />
          </View>
        }
      />

      {/* Manual Location Selection Modal */}
      <Modal visible={showLocationModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Set Your Demo Location</Text>
              <Pressable onPress={() => setShowLocationModal(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </Pressable>
            </View>

            <Text style={styles.modalSub}>
              Select a city landmark or enter a custom address to test how distances recalculate in real-time.
            </Text>

            {/* Quick Landmarks */}
            <Text style={styles.landmarkHeader}>Popular Demo Landmarks:</Text>
            {LANDMARKS.map((lm) => (
              <Pressable
                key={lm.name}
                onPress={() => handleSelectLandmark(lm)}
                style={styles.landmarkItem}
              >
                <Ionicons name="pin" size={16} color={colors.primary} />
                <Text style={styles.landmarkName}>{lm.name}</Text>
                <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
              </Pressable>
            ))}

            {/* Manual custom address input */}
            <View style={{ marginTop: 14 }}>
              <CustomInput
                label="Or Type Custom Address"
                value={manualAddressInput}
                onChangeText={setManualAddressInput}
                placeholder="e.g. 10th Cross, Malleshwaram"
              />
              <CustomButton
                title="Use This Address"
                onPress={handleCustomAddressSubmit}
                size="medium"
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingBottom: 30,
  },
  permissionWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.statusRequestedBg,
    marginHorizontal: 16,
    marginTop: 10,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.statusRequested,
  },
  permissionWarningTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.statusRequested,
  },
  permissionWarningText: {
    fontSize: 11,
    color: colors.textPrimary,
    marginTop: 2,
    lineHeight: 15,
  },
  retryGpsBtn: {
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  retryGpsBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  radiusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 6,
  },
  radiusLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  radiusChips: {
    flexDirection: 'row',
    gap: 6,
  },
  radiusChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  radiusChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  radiusChipText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  radiusChipTextActive: {
    color: '#ffffff',
  },
  nearbyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 10,
  },
  nearbyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  changeLocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changeLocBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  modalSub: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
    marginBottom: 14,
  },
  landmarkHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  landmarkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 10,
  },
  landmarkName: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
});

export default NearbyScreen;
