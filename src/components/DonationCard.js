import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import StatusBadge from './StatusBadge';
import { calculateDistance } from '../services/locationService';

export const DonationCard = ({
  item,
  onPress,
  userLocation,
  index = 0,
}) => {
  // Animated entrance: fade in + slight slide up
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        delay: Math.min(index * 75, 400),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        delay: Math.min(index * 75, 400),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, index]);

  // Calculate distance if both item coords and user coords are present
  const distanceKm =
    userLocation && item.latitude && item.longitude
      ? calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          item.latitude,
          item.longitude
        )
      : null;

  const defaultImg =
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80';

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.pressableCard,
          pressed && { opacity: 0.94, transform: [{ scale: 0.99 }] },
        ]}
      >
        {/* Food Image with status & category overlay */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.imageUrl || defaultImg }}
            style={styles.foodImage}
            resizeMode="cover"
          />

          <View style={styles.overlayTop}>
            <View style={styles.categoryPill}>
              <Text style={styles.categoryText}>{item.category || 'General'}</Text>
            </View>
            <StatusBadge status={item.status || 'Available'} size="small" />
          </View>

          {distanceKm !== null && (
            <View style={styles.distanceBadge}>
              <Ionicons name="location" size={12} color="#ffffff" />
              <Text style={styles.distanceText}>{distanceKm} km away</Text>
            </View>
          )}
        </View>

        {/* Content Section */}
        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.foodName} numberOfLines={1}>
              {item.foodName}
            </Text>
          </View>

          {/* Quantity Badge */}
          <View style={styles.quantityContainer}>
            <Ionicons name="cube-outline" size={14} color={colors.primaryDark} />
            <Text style={styles.quantityText}>
              Quantity: <Text style={styles.quantityHighlight}>{item.quantity} {item.unit}</Text>
            </Text>
          </View>

          {/* Location info */}
          <View style={styles.infoRow}>
            <Ionicons name="business-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.infoText} numberOfLines={1}>
              {item.donorName || item.pickupAddress}
            </Text>
          </View>

          {/* Pickup Deadline */}
          <View style={styles.deadlineRow}>
            <View style={styles.deadlineContent}>
              <Ionicons name="alarm-outline" size={14} color={colors.warning} />
              <Text style={styles.deadlineText} numberOfLines={1}>
                Pickup by: {item.pickupDeadline}
              </Text>
            </View>

            <View style={styles.actionPrompt}>
              <Text style={styles.actionPromptText}>View</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.primary} />
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  pressableCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    height: 165,
    width: '100%',
    backgroundColor: colors.surfaceSubtle,
    position: 'relative',
  },
  foodImage: {
    width: '100%',
    height: '100%',
  },
  overlayTop: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryPill: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  distanceBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(22, 163, 74, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 3,
  },
  distanceText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  body: {
    padding: 14,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  foodName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primaryFaint,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  quantityText: {
    fontSize: 13,
    color: colors.primaryDark,
    fontWeight: '500',
  },
  quantityHighlight: {
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    marginTop: 4,
  },
  deadlineContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  deadlineText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  actionPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  actionPromptText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
});

export default DonationCard;
