import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Pressable,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import Header from '../components/Header';
import StatusBadge from '../components/StatusBadge';
import CustomButton from '../components/CustomButton';
import { useApp } from '../context/AppContext';

export const PickupsScreen = ({ navigation }) => {
  const { role, profile, pickups, updatePickupStatus } = useApp();
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'history'

  // Filter based on active vs completed
  const filteredPickups = pickups.filter((item) => {
    if (activeTab === 'active') {
      return item.status === 'Requested' || item.status === 'Accepted';
    } else {
      return item.status === 'Picked Up' || item.status === 'Cancelled';
    }
  });

  const handleUpdateStatus = (req, newStatus) => {
    Alert.alert(
      'Confirm Action',
      `Update this pickup request status to "${newStatus}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            await updatePickupStatus(req.id, req.donationId, newStatus);
            Alert.alert('Updated', `Pickup request marked as ${newStatus}.`);
          },
        },
      ]
    );
  };

  const renderPickupCard = ({ item }) => {
    return (
      <View style={styles.card}>
        {/* Header row */}
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.foodName}>{item.foodName}</Text>
            <Text style={styles.quantityText}>{item.quantity || 'Food Box'}</Text>
          </View>
          <StatusBadge status={item.status} />
        </View>

        {/* Info Rows */}
        <View style={styles.infoRow}>
          <Ionicons name="person-circle-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.infoText}>
            <Text style={styles.infoBold}>
              {role === 'donor' ? 'Requested by:' : 'Receiver Contact:'}
            </Text>{' '}
            {item.receiverName} ({item.receiverRole || 'NGO'})
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.infoText}>
            <Text style={styles.infoBold}>Contact Phone:</Text> {item.receiverPhone || '+91 98444 11223'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={16} color={colors.warning} />
          <Text style={styles.infoText}>
            <Text style={styles.infoBold}>Estimated Time:</Text> {item.pickupTimeEstimated || 'Within 2 hours'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={16} color={colors.primary} />
          <Text style={styles.infoText} numberOfLines={2}>
            <Text style={styles.infoBold}>Pickup Location:</Text> {item.pickupAddress}
          </Text>
        </View>

        {item.notes ? (
          <View style={styles.notesBox}>
            <Text style={styles.notesLabel}>Volunteer Note:</Text>
            <Text style={styles.notesText}>{item.notes}</Text>
          </View>
        ) : null}

        {/* Action Controls */}
        <View style={styles.actionRow}>
          {role === 'donor' ? (
            // Donor status management
            item.status === 'Requested' ? (
              <>
                <CustomButton
                  title="Decline"
                  variant="outline"
                  size="small"
                  onPress={() => handleUpdateStatus(item, 'Cancelled')}
                  style={{ flex: 1, marginRight: 6 }}
                />
                <CustomButton
                  title="Accept Request"
                  variant="primary"
                  size="small"
                  onPress={() => handleUpdateStatus(item, 'Accepted')}
                  style={{ flex: 1, marginLeft: 6 }}
                />
              </>
            ) : item.status === 'Accepted' ? (
              <CustomButton
                title="Mark Picked Up / Completed"
                variant="primary"
                size="small"
                onPress={() => handleUpdateStatus(item, 'Picked Up')}
                style={{ flex: 1 }}
              />
            ) : null
          ) : (
            // Receiver status management
            item.status === 'Requested' ? (
              <CustomButton
                title="Cancel My Request"
                variant="outline"
                size="small"
                onPress={() => handleUpdateStatus(item, 'Cancelled')}
                style={{ flex: 1 }}
              />
            ) : item.status === 'Accepted' ? (
              <CustomButton
                title="Confirm Food Collected"
                variant="primary"
                size="small"
                onPress={() => handleUpdateStatus(item, 'Picked Up')}
                style={{ flex: 1 }}
              />
            ) : null
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Pickup Management" />

      {/* Segmented Tab Bar */}
      <View style={styles.segmentedContainer}>
        <Pressable
          onPress={() => setActiveTab('active')}
          style={[
            styles.segmentBtn,
            activeTab === 'active' && styles.segmentBtnActive,
          ]}
        >
          <Text
            style={[
              styles.segmentText,
              activeTab === 'active' && styles.segmentTextActive,
            ]}
          >
            Active Requests (
            {pickups.filter((p) => p.status === 'Requested' || p.status === 'Accepted').length}
            )
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('history')}
          style={[
            styles.segmentBtn,
            activeTab === 'history' && styles.segmentBtnActive,
          ]}
        >
          <Text
            style={[
              styles.segmentText,
              activeTab === 'history' && styles.segmentTextActive,
            ]}
          >
            History (
            {pickups.filter((p) => p.status === 'Picked Up' || p.status === 'Cancelled').length}
            )
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={filteredPickups}
        keyExtractor={(item) => item.id}
        renderItem={renderPickupCard}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons
                name={activeTab === 'active' ? 'hourglass-outline' : 'checkmark-done-circle-outline'}
                size={38}
                color={colors.textMuted}
              />
            </View>
            <Text style={styles.emptyTitle}>
              {activeTab === 'active' ? 'No Active Pickup Requests' : 'No Past History Yet'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {role === 'receiver'
                ? 'Explore nearby donations on the Home screen to request surplus meals.'
                : 'When receivers request food from your listings, they will show up here.'}
            </Text>
            {role === 'receiver' && (
              <CustomButton
                title="Browse Available Food"
                onPress={() => navigation.navigate('Home')}
                size="small"
                style={{ marginTop: 14 }}
              />
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSubtle,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 9,
  },
  segmentBtnActive: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  segmentTextActive: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  quantityText: {
    fontSize: 13,
    color: colors.primaryDark,
    fontWeight: '700',
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 17,
  },
  infoBold: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  notesBox: {
    backgroundColor: colors.surfaceSubtle,
    padding: 10,
    borderRadius: 8,
    marginTop: 6,
    marginBottom: 10,
  },
  notesLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  notesText: {
    fontSize: 12,
    color: colors.textPrimary,
    marginTop: 2,
    fontStyle: 'italic',
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
    marginTop: 20,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
});

export default PickupsScreen;
