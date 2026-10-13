import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';

export const SummaryCard = ({ availableCount = 0, pickupsCompleted = 0, activeRequests = 0 }) => {
  return (
    <View style={styles.container}>
      <View style={styles.metricBox}>
        <View style={[styles.iconWrap, { backgroundColor: colors.statusAvailableBg }]}>
          <Ionicons name="fast-food" size={18} color={colors.primary} />
        </View>
        <Text style={styles.metricNumber}>{availableCount}</Text>
        <Text style={styles.metricLabel}>Available</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.metricBox}>
        <View style={[styles.iconWrap, { backgroundColor: colors.statusRequestedBg }]}>
          <Ionicons name="time" size={18} color={colors.statusRequested} />
        </View>
        <Text style={styles.metricNumber}>{activeRequests}</Text>
        <Text style={styles.metricLabel}>Pending</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.metricBox}>
        <View style={[styles.iconWrap, { backgroundColor: colors.statusAcceptedBg }]}>
          <Ionicons name="checkmark-done" size={18} color={colors.statusAccepted} />
        </View>
        <Text style={styles.metricNumber}>{pickupsCompleted}</Text>
        <Text style={styles.metricLabel}>Rescued</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginHorizontal: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  metricBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  metricNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  metricLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: colors.border,
  },
});

export default SummaryCard;
