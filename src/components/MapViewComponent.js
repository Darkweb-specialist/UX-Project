import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { calculateDistance } from '../services/locationService';

export const MapViewComponent = ({
  userLocation,
  donations = [],
  onSelectDonation,
  onOpenManualEntry,
}) => {
  const [selectedPin, setSelectedPin] = useState(null);

  // Filter donations with valid coordinates
  const validDonations = donations.filter((d) => d.latitude && d.longitude);

  return (
    <View style={styles.container}>
      {/* Map Header Controls */}
      <View style={styles.mapToolbar}>
        <View style={styles.locationPill}>
          <Ionicons
            name={userLocation.granted ? 'navigate-circle' : 'location-outline'}
            size={16}
            color={userLocation.granted ? colors.primary : colors.warning}
          />
          <Text style={styles.locationAddressText} numberOfLines={1}>
            {userLocation.address || 'MG Road, Bangalore'}
          </Text>
        </View>

        <Pressable
          onPress={onOpenManualEntry}
          style={({ pressed }) => [styles.manualButton, pressed && { opacity: 0.8 }]}
        >
          <Ionicons name="create-outline" size={14} color={colors.primaryDark} />
          <Text style={styles.manualButtonText}>Set Location</Text>
        </Pressable>
      </View>

      {/* Visual Map Radar Canvas */}
      <View style={styles.radarMapBox}>
        {/* Radar concentric range circles (5km, 10km, 15km) */}
        <View style={[styles.rangeRing, styles.ringOuter]} />
        <View style={[styles.rangeRing, styles.ringMiddle]} />
        <View style={[styles.rangeRing, styles.ringInner]} />

        {/* Center marker: User Location */}
        <View style={styles.userBeacon}>
          <View style={styles.userPulse} />
          <View style={styles.userCenterDot}>
            <Ionicons name="person" size={12} color="#ffffff" />
          </View>
          <Text style={styles.userBeaconLabel}>You</Text>
        </View>

        {/* Dynamic Donation Pins projected in the coordinate radius */}
        {validDonations.slice(0, 5).map((don, idx) => {
          const dist = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            don.latitude,
            don.longitude
          );

          // Calculate visual offsets based on latitude & longitude differences
          const latDiff = (don.latitude - userLocation.latitude) * 1600;
          const lonDiff = (don.longitude - userLocation.longitude) * 1600;

          // Clamp within radar box
          const clampedX = Math.max(-120, Math.min(120, lonDiff));
          const clampedY = Math.max(-85, Math.min(85, -latDiff));

          const isSelected = selectedPin?.id === don.id;

          return (
            <Pressable
              key={don.id}
              onPress={() => setSelectedPin(don)}
              style={[
                styles.donationPin,
                {
                  transform: [
                    { translateX: clampedX },
                    { translateY: clampedY },
                  ],
                },
              ]}
            >
              <View
                style={[
                  styles.pinBubble,
                  isSelected && styles.pinBubbleSelected,
                  { backgroundColor: don.status === 'Available' ? colors.primary : colors.statusRequested },
                ]}
              >
                <Ionicons name="restaurant" size={13} color="#ffffff" />
              </View>
              <View style={styles.pinTag}>
                <Text style={styles.pinTagText} numberOfLines={1}>
                  {dist !== null ? `${dist} km` : don.category}
                </Text>
              </View>
            </Pressable>
          );
        })}

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
            <Text style={styles.legendText}>Available</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.statusRequested }]} />
            <Text style={styles.legendText}>Requested</Text>
          </View>
        </View>
      </View>

      {/* Selected Donation Callout Card */}
      {selectedPin ? (
        <View style={styles.calloutCard}>
          <View style={styles.calloutHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.calloutTitle} numberOfLines={1}>
                {selectedPin.foodName}
              </Text>
              <Text style={styles.calloutSub} numberOfLines={1}>
                {selectedPin.pickupAddress}
              </Text>
            </View>
            <Pressable onPress={() => setSelectedPin(null)} style={{ padding: 4 }}>
              <Ionicons name="close-circle" size={20} color={colors.textMuted} />
            </Pressable>
          </View>

          <View style={styles.calloutFooter}>
            <Text style={styles.calloutQuantity}>
              {selectedPin.quantity} {selectedPin.unit} available
            </Text>
            <Pressable
              onPress={() => onSelectDonation(selectedPin)}
              style={styles.calloutActionBtn}
            >
              <Text style={styles.calloutActionBtnText}>View Details</Text>
              <Ionicons name="arrow-forward" size={14} color="#ffffff" />
            </Pressable>
          </View>
        </View>
      ) : (
        <Text style={styles.mapPromptNotice}>
          Tap any green pin on the radar map to preview food items nearby
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  mapToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    flex: 1,
    marginRight: 8,
    gap: 6,
  },
  locationAddressText: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '600',
    flex: 1,
  },
  manualButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: colors.primaryFaint,
  },
  manualButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  radarMapBox: {
    height: 220,
    backgroundColor: '#0f172a',
    borderRadius: 14,
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rangeRing: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  ringOuter: {
    width: 200,
    height: 200,
  },
  ringMiddle: {
    width: 130,
    height: 130,
  },
  ringInner: {
    width: 70,
    height: 70,
  },
  userBeacon: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  userPulse: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.35)',
  },
  userCenterDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  userBeaconLabel: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  donationPin: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 20,
  },
  pinBubble: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  pinBubbleSelected: {
    borderColor: '#fbbf24',
    borderWidth: 2.5,
    transform: [{ scale: 1.2 }],
  },
  pinTag: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginTop: 2,
  },
  pinTagText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '700',
  },
  legend: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    gap: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600',
  },
  calloutCard: {
    marginTop: 10,
    padding: 10,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  calloutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  calloutSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  calloutFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  calloutQuantity: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  calloutActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  calloutActionBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  mapPromptNotice: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default MapViewComponent;
