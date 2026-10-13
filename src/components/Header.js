import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { useApp } from '../context/AppContext';

export const Header = ({ title, showRoleSwitch = true, subtitle }) => {
  const { role, switchRole, isBackendConnected } = useApp();

  const toggleRole = () => {
    const nextRole = role === 'donor' ? 'receiver' : 'donor';
    switchRole(nextRole);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.branding}>
          <View style={styles.iconCircle}>
            <Ionicons name="heart" size={18} color="#ffffff" />
          </View>
          <View>
            <Text style={styles.appName}>Smart Food Rescue</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        </View>

        <View style={styles.rightSection}>
          {/* Connection status indicator */}
          <View
            style={[
              styles.connectionPill,
              { backgroundColor: isBackendConnected ? colors.statusAvailableBg : colors.surfaceSubtle },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isBackendConnected ? colors.primary : colors.textMuted },
              ]}
            />
            <Text
              style={[
                styles.connectionText,
                { color: isBackendConnected ? colors.primaryDark : colors.textSecondary },
              ]}
            >
              {isBackendConnected ? 'API Live' : 'Demo Mode'}
            </Text>
          </View>

          {/* Role badge with switch button */}
          {showRoleSwitch && (
            <Pressable
              onPress={toggleRole}
              style={({ pressed }) => [
                styles.roleBadge,
                role === 'donor' ? styles.roleDonor : styles.roleReceiver,
                pressed && { opacity: 0.8 },
              ]}
            >
              <Ionicons
                name={role === 'donor' ? 'gift-outline' : 'hand-left-outline'}
                size={13}
                color="#ffffff"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.roleText}>
                {role === 'donor' ? 'Donor' : 'Receiver'}
              </Text>
              <Ionicons name="swap-horizontal" size={12} color="#ffffff" style={{ marginLeft: 4 }} />
            </Pressable>
          )}
        </View>
      </View>

      {title && <Text style={styles.screenTitle}>{title}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  branding: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  appName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  connectionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  connectionText: {
    fontSize: 10,
    fontWeight: '700',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  roleDonor: {
    backgroundColor: colors.primaryDark,
  },
  roleReceiver: {
    backgroundColor: colors.statusAccepted,
  },
  roleText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 10,
  },
});

export default Header;
