import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Pressable,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import StatusBadge from '../components/StatusBadge';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import { useApp } from '../context/AppContext';
import { calculateDistance } from '../services/locationService';

export const DonationDetailsScreen = ({ route, navigation }) => {
  const { donationId } = route.params || {};
  const {
    role,
    profile,
    donations,
    pickups,
    userLocation,
    requestPickup,
    updatePickupStatus,
  } = useApp();

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState('Within 1 hour');
  const [volunteerNote, setVolunteerNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Find the donation
  const donation = donations.find((d) => d.id === donationId);

  // Find associated pickup request if any
  const associatedPickup = pickups.find((p) => p.donationId === donationId);

  // Check if current user already requested this donation
  const isAlreadyRequestedByMe = pickups.some(
    (p) =>
      p.donationId === donationId &&
      p.receiverName === profile?.name &&
      p.status !== 'Cancelled'
  );

  if (!donation) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFoundContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={styles.notFoundTitle}>Donation Not Found</Text>
          <Text style={styles.notFoundText}>This donation may have been removed or fulfilled.</Text>
          <CustomButton
            title="Back to Home"
            onPress={() => navigation.goBack()}
            style={{ marginTop: 16 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Calculate distance
  const distanceKm =
    userLocation && donation.latitude && donation.longitude
      ? calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          donation.latitude,
          donation.longitude
        )
      : null;

  // Handle pickup submission
  const handleConfirmPickup = async () => {
    try {
      setIsSubmitting(true);
      const res = await requestPickup({
        donationId: donation.id,
        notes: volunteerNote.trim() || 'Food rescue pickup by verified receiver.',
        estimatedTime: estimatedTime.trim(),
      });

      if (res.success) {
        setShowRequestModal(false);
        Alert.alert(
          'Pickup Request Sent!',
          'The donor has been notified. You can track this in "My Pickups".',
          [
            {
              text: 'View Pickups',
              onPress: () => navigation.navigate('My Pickups'),
            },
            { text: 'OK' },
          ]
        );
      } else {
        Alert.alert('Notice', res.message || 'Could not place pickup request.');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to request pickup.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Donor action handlers
  const handleDonorAction = async (newStatus) => {
    Alert.alert(
      'Confirm Status Change',
      `Are you sure you want to change this donation status to "${newStatus}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            const reqId = associatedPickup ? associatedPickup.id : `req-${donation.id}`;
            await updatePickupStatus(reqId, donation.id, newStatus);
            Alert.alert('Status Updated', `Donation marked as ${newStatus}.`);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero Image & Top Bar */}
        <View style={styles.imageBox}>
          <Image
            source={{
              uri:
                donation.imageUrl ||
                'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80',
            }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          {/* Back button */}
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={20} color="#0f172a" />
          </Pressable>

          {/* Distance Badge */}
          {distanceKm !== null && (
            <View style={styles.floatingDistanceBadge}>
              <Ionicons name="location" size={14} color="#ffffff" />
              <Text style={styles.distanceText}>{distanceKm} km away</Text>
            </View>
          )}
        </View>

        {/* Content Body */}
        <View style={styles.body}>
          {/* Status & Category Row */}
          <View style={styles.tagRow}>
            <View style={styles.categoryPill}>
              <Text style={styles.categoryText}>{donation.category}</Text>
            </View>
            {donation.dietary && (
              <View style={[styles.dietaryPill, donation.dietary === 'Vegetarian' && styles.vegPill]}>
                <Ionicons
                  name={donation.dietary === 'Vegetarian' ? 'leaf' : 'nutrition'}
                  size={12}
                  color={donation.dietary === 'Vegetarian' ? colors.primaryDark : '#b45309'}
                />
                <Text
                  style={[
                    styles.dietaryText,
                    donation.dietary === 'Vegetarian' && { color: colors.primaryDark },
                  ]}
                >
                  {donation.dietary}
                </Text>
              </View>
            )}
            <StatusBadge status={donation.status} />
          </View>

          {/* Food Title */}
          <Text style={styles.foodTitle}>{donation.foodName}</Text>

          {/* Quantity Callout Box */}
          <View style={styles.quantityCallout}>
            <View style={styles.quantityIconWrap}>
              <Ionicons name="cube" size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.quantityCalloutLabel}>Available Quantity</Text>
              <Text style={styles.quantityCalloutValue}>
                {donation.quantity} {donation.unit}
              </Text>
            </View>
          </View>

          {/* Details Grid */}
          <View style={styles.detailsGrid}>
            <View style={styles.gridItem}>
              <Ionicons name="time-outline" size={18} color={colors.primary} />
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.gridLabel}>Prepared At</Text>
                <Text style={styles.gridValue}>{donation.preparedAt || 'Recently'}</Text>
              </View>
            </View>

            <View style={styles.gridItem}>
              <Ionicons name="alarm-outline" size={18} color={colors.warning} />
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.gridLabel}>Pickup Deadline</Text>
                <Text style={[styles.gridValue, { color: colors.warning }]}>
                  {donation.pickupDeadline}
                </Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionHeading}>Description & Hygiene Notes</Text>
            <Text style={styles.descriptionText}>{donation.description}</Text>
          </View>

          {/* Location & Address */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionHeading}>Pickup Location</Text>
            <View style={styles.addressBox}>
              <Ionicons name="location-outline" size={20} color={colors.primary} />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.addressText}>{donation.pickupAddress}</Text>
                {donation.latitude && donation.longitude && (
                  <Text style={styles.coordinatesText}>
                    GPS: {donation.latitude.toFixed(4)}, {donation.longitude.toFixed(4)}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Donor Information Card */}
          <View style={styles.donorCard}>
            <View style={styles.donorAvatarCircle}>
              <Ionicons name="storefront" size={22} color="#ffffff" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.donorCardName}>{donation.donorName}</Text>
              <Text style={styles.donorCardSub}>{donation.donorType || 'Verified Donor'}</Text>
              <Text style={styles.donorPhoneText}>
                <Ionicons name="call-outline" size={13} color={colors.textSecondary} /> {donation.donorPhone}
              </Text>
            </View>
          </View>

          {/* ACTION BUTTONS BASED ON USER ROLE & STATUS */}
          <View style={styles.actionSection}>
            {role === 'receiver' ? (
              // RECEIVER ACTIONS
              isAlreadyRequestedByMe ? (
                <View style={styles.alreadyRequestedBox}>
                  <Ionicons name="checkmark-circle" size={24} color={colors.statusAccepted} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.alreadyRequestedTitle}>Request Placed</Text>
                    <Text style={styles.alreadyRequestedSub}>
                      You have already requested this donation. Check the "My Pickups" tab for status updates.
                    </Text>
                  </View>
                  <CustomButton
                    title="View Pickups"
                    onPress={() => navigation.navigate('My Pickups')}
                    size="small"
                  />
                </View>
              ) : donation.status === 'Available' ? (
                <CustomButton
                  title="Request Food Pickup"
                  onPress={() => setShowRequestModal(true)}
                  size="large"
                  icon={<Ionicons name="hand-left" size={18} color="#ffffff" />}
                />
              ) : (
                <View style={styles.unavailableBox}>
                  <Text style={styles.unavailableText}>
                    This donation is currently marked as <Text style={{ fontWeight: '700' }}>{donation.status}</Text>.
                  </Text>
                </View>
              )
            ) : (
              // DONOR ACTIONS
              <View style={styles.donorActionsWrap}>
                <Text style={styles.donorActionPrompt}>Donor Management Actions:</Text>
                {donation.status === 'Requested' && (
                  <CustomButton
                    title="Accept Pickup Request"
                    onPress={() => handleDonorAction('Accepted')}
                    size="medium"
                    style={{ marginBottom: 10 }}
                  />
                )}
                {donation.status === 'Accepted' && (
                  <CustomButton
                    title="Mark as Picked Up / Completed"
                    onPress={() => handleDonorAction('Picked Up')}
                    size="medium"
                    style={{ marginBottom: 10 }}
                  />
                )}
                {donation.status !== 'Picked Up' && donation.status !== 'Cancelled' && (
                  <CustomButton
                    title="Cancel Donation"
                    onPress={() => handleDonorAction('Cancelled')}
                    variant="danger"
                    size="small"
                  />
                )}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Pickup Request Modal */}
      <Modal visible={showRequestModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request Food Pickup</Text>
              <Pressable onPress={() => setShowRequestModal(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </Pressable>
            </View>

            <Text style={styles.modalSub}>
              Confirm pickup details for <Text style={{ fontWeight: '700' }}>{donation.foodName}</Text> ({donation.quantity} {donation.unit}).
            </Text>

            <CustomInput
              label="Estimated Pickup Arrival Time"
              value={estimatedTime}
              onChangeText={setEstimatedTime}
              placeholder="e.g. Within 45 minutes / Today 5:30 PM"
            />

            <CustomInput
              label="Volunteer / Vehicle Notes"
              value={volunteerNote}
              onChangeText={setVolunteerNote}
              placeholder="e.g. NGO Van #KA-01-2345, insulated carrier boxes ready"
              multiline
              numberOfLines={2}
            />

            <View style={styles.verificationNote}>
              <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
              <Text style={styles.verificationNoteText}>
                Requesting as: {profile?.name || 'NGO Receiver'} ({profile?.organization || 'Community Rescue'})
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <CustomButton
                title="Cancel"
                variant="secondary"
                onPress={() => setShowRequestModal(false)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <CustomButton
                title="Confirm Request"
                onPress={handleConfirmPickup}
                loading={isSubmitting}
                style={{ flex: 1, marginLeft: 8 }}
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
    backgroundColor: colors.surface,
  },
  container: {
    paddingBottom: 40,
  },
  imageBox: {
    height: 240,
    width: '100%',
    position: 'relative',
    backgroundColor: colors.surfaceSubtle,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 14,
    left: 14,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  floatingDistanceBadge: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(22, 163, 74, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  distanceText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  body: {
    padding: 20,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  categoryPill: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  dietaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  vegPill: {
    backgroundColor: colors.primaryFaint,
  },
  dietaryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#b45309',
  },
  foodTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 28,
    marginBottom: 14,
  },
  quantityCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryFaint,
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  quantityIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityCalloutLabel: {
    fontSize: 12,
    color: colors.primaryDark,
    fontWeight: '600',
  },
  quantityCalloutValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primaryDark,
    marginTop: 2,
  },
  detailsGrid: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  gridItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  gridValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  sectionBlock: {
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  addressBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceSubtle,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addressText: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '600',
    lineHeight: 18,
  },
  coordinatesText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
  },
  donorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    padding: 14,
    borderRadius: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  donorAvatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donorCardName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  donorCardSub: {
    fontSize: 12,
    color: colors.primaryDark,
    fontWeight: '600',
  },
  donorPhoneText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actionSection: {
    marginTop: 8,
  },
  alreadyRequestedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.statusAcceptedBg,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.statusAccepted,
  },
  alreadyRequestedTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.statusAccepted,
  },
  alreadyRequestedSub: {
    fontSize: 11,
    color: colors.textPrimary,
    marginTop: 2,
    lineHeight: 15,
  },
  unavailableBox: {
    backgroundColor: colors.surfaceSubtle,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  unavailableText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  donorActionsWrap: {
    backgroundColor: colors.surfaceSubtle,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  donorActionPrompt: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 12,
  },
  notFoundText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
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
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  verificationNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primaryFaint,
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
  },
  verificationNoteText: {
    fontSize: 12,
    color: colors.primaryDark,
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
  },
});

export default DonationDetailsScreen;
