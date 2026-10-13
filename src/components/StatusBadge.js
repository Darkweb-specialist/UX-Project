import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../theme/colors';

export const StatusBadge = ({ status, size = 'medium' }) => {
  let badgeBg = colors.statusAvailableBg;
  let textColor = colors.statusAvailable;

  switch (status) {
    case 'Available':
      badgeBg = colors.statusAvailableBg;
      textColor = colors.statusAvailable;
      break;
    case 'Requested':
      badgeBg = colors.statusRequestedBg;
      textColor = colors.statusRequested;
      break;
    case 'Accepted':
      badgeBg = colors.statusAcceptedBg;
      textColor = colors.statusAccepted;
      break;
    case 'Picked Up':
      badgeBg = colors.statusPickedUpBg;
      textColor = colors.statusPickedUp;
      break;
    case 'Cancelled':
      badgeBg = colors.statusCancelledBg;
      textColor = colors.statusCancelled;
      break;
    default:
      badgeBg = colors.surfaceSubtle;
      textColor = colors.textSecondary;
  }

  const isSmall = size === 'small';

  return (
    <View style={[styles.badge, { backgroundColor: badgeBg }, isSmall && styles.badgeSmall]}>
      <View style={[styles.dot, { backgroundColor: textColor }, isSmall && styles.dotSmall]} />
      <Text style={[styles.text, { color: textColor }, isSmall && styles.textSmall]}>
        {status}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  dotSmall: {
    width: 5,
    height: 5,
    marginRight: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  textSmall: {
    fontSize: 11,
  },
});

export default StatusBadge;
