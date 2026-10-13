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
import Header from '../components/Header';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import { useApp } from '../context/AppContext';
import apiService, { setApiBaseUrl, getApiBaseUrl } from '../services/api';

export const ProfileScreen = ({ navigation }) => {
  const {
    role,
    profile,
    switchRole,
    donations,
    pickups,
    resetDemoData,
    isBackendConnected,
    refreshData,
  } = useApp();

  const [showBackendModal, setShowBackendModal] = useState(false);
  const [customApiUrl, setCustomApiUrl] = useState(getApiBaseUrl());
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleToggleRole = () => {
    const nextRole = role === 'donor' ? 'receiver' : 'donor';
    switchRole(nextRole);
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset Demo Data',
      'This will restore all sample donations, pickup requests, and profiles to fresh initial demo values. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: async () => {
            await resetDemoData();
            Alert.alert('Demo Reset', 'All records have been reset to clean sample state.');
          },
        },
      ]
    );
  };

  const handleTestBackend = async () => {
    try {
      setTestingConnection(true);
      setTestResult(null);
      setApiBaseUrl(customApiUrl);
      const res = await apiService.checkHealth();
      if (res.isConnected) {
        setTestResult({
          success: true,
          message: 'Connected successfully to backend API!',
          details: res.data,
        });
        refreshData();
      } else {
        setTestResult({
          success: false,
          message: 'Could not connect to backend. Falling back to local offline demo mode.',
        });
      }
    } catch (e) {
      setTestResult({
        success: false,
        message: e.message || 'Connection failed.',
      });
    } finally {
      setTestingConnection(false);
    }
  };

  // Activity counts
  const donorDonations = donations.filter((d) => d.donorName?.includes(profile?.name?.split(' ')[0] || ''));
  const receiverPickups = pickups.filter((p) => p.receiverName?.includes(profile?.name?.split(' ')[0] || ''));

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="User Profile" showRoleSwitch={false} />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarRow}>
            <View
              style={[
                styles.avatarCircle,
                { backgroundColor: role === 'donor' ? colors.primaryDark : colors.statusAccepted },
              ]}
            >
              <Ionicons
                name={role === 'donor' ? 'restaurant' : 'heart-half'}
                size={34}
                color="#ffffff"
              />
            </View>

            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.profileName}>{profile?.name || 'Demo User'}</Text>
              <Text style={styles.profileOrg}>{profile?.organization || 'Food Rescue Initiative'}</Text>
              <View
                style={[
                  styles.roleBadge,
                  role === 'donor' ? styles.roleBadgeDonor : styles.roleBadgeReceiver,
                ]}
              >
                <Text style={styles.roleBadgeText}>
                  {role === 'donor' ? 'Role: Food Donor' : 'Role: Food Receiver'}
                </Text>
              </View>
            </View>
          </View>

          {/* Contact Details List */}
          <View style={styles.contactSection}>
            <View style={styles.contactItem}>
              <Ionicons name="call-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.contactText}>{profile?.phone || '+91 98765 43210'}</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="mail-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.contactText}>{profile?.email || 'user@example.com'}</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.contactText}>{profile?.address || 'MG Road, Bangalore'}</Text>
            </View>
          </View>

          {/* Edit Profile Button */}
          <CustomButton
            title="Edit Profile Information"
            variant="outline"
            size="small"
            onPress={() => navigation.navigate('EditProfile')}
            style={{ marginTop: 12 }}
          />
        </View>

        {/* Impact Statistics */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Your Community Impact</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {role === 'donor' ? profile?.donationsCount || 14 : profile?.pickupsCompleted || 22}
              </Text>
              <Text style={styles.statLabel}>
                {role === 'donor' ? 'Donations Listed' : 'Pickups Completed'}
              </Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {role === 'donor' ? profile?.mealsProvided || 320 : profile?.peopleServed || 540}
              </Text>
              <Text style={styles.statLabel}>
                {role === 'donor' ? 'Meals Donated' : 'People Fed'}
              </Text>
            </View>
          </View>
        </View>

        {/* Switch Role Option */}
        <View style={styles.sectionCard}>
          <View style={styles.switchHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Current Mode</Text>
              <Text style={styles.switchSub}>
                Currently running in <Text style={{ fontWeight: '700' }}>{role.toUpperCase()}</Text> mode.
              </Text>
            </View>
            <Pressable onPress={handleToggleRole} style={styles.switchRoleBtn}>
              <Ionicons name="swap-horizontal" size={16} color="#ffffff" />
              <Text style={styles.switchRoleBtnText}>
                Switch to {role === 'donor' ? 'Receiver' : 'Donor'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Backend Connectivity Status & Config */}
        <View style={styles.sectionCard}>
          <View style={styles.backendHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Backend Architecture</Text>
              <Text style={styles.switchSub}>
                Node.js Express + SQLite API: {isBackendConnected ? 'Connected & Live' : 'Demo Mode (Offline Fallback)'}
              </Text>
            </View>
            <Pressable
              onPress={() => setShowBackendModal(true)}
              style={styles.configApiBtn}
            >
              <Ionicons name="server-outline" size={14} color={colors.primaryDark} />
              <Text style={styles.configApiBtnText}>Configure</Text>
            </Pressable>
          </View>
        </View>

        {/* Demo Reset Button */}
        <View style={styles.resetSection}>
          <CustomButton
            title="Reset All Demo Data (College Viva)"
            variant="danger"
            size="medium"
            icon={<Ionicons name="refresh-circle" size={20} color="#ffffff" />}
            onPress={handleResetData}
          />
          <Text style={styles.resetHelpText}>
            Restores original sample food donations, test locations, and pickup histories for a clean live examiner demonstration.
          </Text>
        </View>
      </ScrollView>

      {/* Backend Configuration Modal */}
      <Modal visible={showBackendModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Backend API Settings</Text>
              <Pressable onPress={() => setShowBackendModal(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </Pressable>
            </View>

            <Text style={styles.modalSub}>
              Enter the Express backend API address. On an Android emulator use `http://10.0.2.2:5000/api`, or your local PC LAN IP (e.g. `http://192.168.1.X:5000/api`).
            </Text>

            <CustomInput
              label="API Base URL"
              value={customApiUrl}
              onChangeText={setCustomApiUrl}
              placeholder="http://localhost:5000/api"
            />

            {testResult && (
              <View
                style={[
                  styles.testResultBox,
                  testResult.success ? styles.testSuccess : styles.testFail,
                ]}
              >
                <Ionicons
                  name={testResult.success ? 'checkmark-circle' : 'close-circle'}
                  size={18}
                  color={testResult.success ? colors.primary : colors.error}
                />
                <Text
                  style={[
                    styles.testResultText,
                    { color: testResult.success ? colors.primaryDark : colors.error },
                  ]}
                >
                  {testResult.message}
                </Text>
              </View>
            )}

            <View style={{ flexDirection: 'row', marginTop: 12, gap: 10 }}>
              <CustomButton
                title="Close"
                variant="secondary"
                onPress={() => setShowBackendModal(false)}
                style={{ flex: 1 }}
              />
              <CustomButton
                title="Test Connection"
                onPress={handleTestBackend}
                loading={testingConnection}
                style={{ flex: 1 }}
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
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  profileOrg: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 6,
  },
  roleBadgeDonor: {
    backgroundColor: colors.primaryFaint,
  },
  roleBadgeReceiver: {
    backgroundColor: colors.statusAcceptedBg,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  contactSection: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 13,
    color: colors.textPrimary,
    flex: 1,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.border,
  },
  switchHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  switchRoleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  switchRoleBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  backendHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  configApiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryFaint,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  configApiBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  resetSection: {
    marginTop: 10,
    alignItems: 'center',
  },
  resetHelpText: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 16,
    paddingHorizontal: 12,
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
    marginBottom: 14,
    lineHeight: 16,
  },
  testResultBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  testSuccess: {
    backgroundColor: colors.primaryFaint,
  },
  testFail: {
    backgroundColor: '#fee2e2',
  },
  testResultText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
});

export default ProfileScreen;
