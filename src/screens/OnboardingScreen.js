import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import { useApp } from '../context/AppContext';

export const OnboardingScreen = ({ navigation }) => {
  const { completeOnboarding, updateProfile } = useApp();
  const [selectedRole, setSelectedRole] = useState('donor');
  const [name, setName] = useState('Chef Ananya Sharma');
  const [organization, setOrganization] = useState('Green Leaf Bistro');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    if (role === 'donor') {
      setName('Chef Ananya Sharma');
      setOrganization('Green Leaf Bistro');
      setPhone('+91 98765 43210');
    } else {
      setName('Rajesh Varma (Volunteer)');
      setOrganization('Hope For All Food Rescue NGO');
      setPhone('+91 98450 78901');
    }
  };

  const handleDirectEnter = async (roleToUse) => {
    try {
      setIsSubmitting(true);
      const isDonor = roleToUse === 'donor';
      const userProfile = {
        name: isDonor ? (name || 'Chef Ananya Sharma') : (name || 'Rajesh Varma (Volunteer)'),
        organization: isDonor ? (organization || 'Green Leaf Bistro') : (organization || 'Hope For All Food Rescue NGO'),
        phone: isDonor ? (phone || '+91 98765 43210') : (phone || '+91 98450 78901'),
        role: roleToUse,
      };

      await updateProfile(userProfile);
      await completeOnboarding(roleToUse);

      // Transition stack immediately to MainTabs
      if (navigation.replace) {
        navigation.replace('MainTabs');
      } else {
        navigation.navigate('MainTabs');
      }
    } catch (err) {
      console.error('Error entering app:', err);
      navigation.navigate('MainTabs');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero Banner */}
        <View style={styles.heroSection}>
          <View style={styles.logoCircle}>
            <Ionicons name="fast-food" size={40} color="#ffffff" />
          </View>
          <Text style={styles.appTitle}>Smart Food Rescue</Text>
          <Text style={styles.tagline}>
            Connecting Surplus Food with Hungry Hearts
          </Text>
          <Text style={styles.description}>
            Reduce food waste. Restaurants, bakeries and hotels donate surplus meals, and NGOs/volunteers pick them up in real time.
          </Text>
        </View>

        {/* Quick 1-Click Launch Header */}
        <View style={styles.quickAccessBar}>
          <Text style={styles.quickAccessLabel}>⚡ Quick Demo Access (1-Click):</Text>
          <View style={styles.quickAccessButtons}>
            <CustomButton
              title="Launch as Donor"
              size="small"
              variant="primary"
              loading={isSubmitting && selectedRole === 'donor'}
              icon={<Ionicons name="gift" size={14} color="#ffffff" />}
              onPress={() => handleDirectEnter('donor')}
              style={{ flex: 1, marginRight: 6 }}
            />
            <CustomButton
              title="Launch as Receiver"
              size="small"
              variant="outline"
              loading={isSubmitting && selectedRole === 'receiver'}
              icon={<Ionicons name="hand-left" size={14} color={colors.primary} />}
              onPress={() => handleDirectEnter('receiver')}
              style={{ flex: 1, marginLeft: 6 }}
            />
          </View>
        </View>

        {/* Role Selection Box */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Select Your Role</Text>
          <Text style={styles.sectionSubtitle}>
            Choose whether you are giving surplus food or collecting it:
          </Text>

          <View style={styles.roleGrid}>
            {/* Donor Option */}
            <Pressable
              onPress={() => handleRoleSelect('donor')}
              style={[
                styles.roleCard,
                selectedRole === 'donor' && styles.roleCardActive,
              ]}
            >
              <View style={styles.roleCardHeader}>
                <View
                  style={[
                    styles.roleIconCircle,
                    { backgroundColor: selectedRole === 'donor' ? colors.primaryDark : colors.surfaceSubtle },
                  ]}
                >
                  <Ionicons
                    name="gift"
                    size={24}
                    color={selectedRole === 'donor' ? '#ffffff' : colors.primary}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.roleName}>Food Donor</Text>
                  <Text style={styles.roleTag}>Restaurant / Hotel / Caterer / Individual</Text>
                </View>
                {selectedRole === 'donor' && (
                  <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                )}
              </View>

              <Text style={styles.roleDetail}>
                Post surplus edible meals with photos, quantity, and pickup deadlines to avoid food wastage.
              </Text>

              <CustomButton
                title="Enter as Food Donor ➔"
                size="small"
                variant={selectedRole === 'donor' ? 'primary' : 'outline'}
                loading={isSubmitting && selectedRole === 'donor'}
                onPress={() => handleDirectEnter('donor')}
                style={{ marginTop: 10 }}
              />
            </Pressable>

            {/* Receiver Option */}
            <Pressable
              onPress={() => handleRoleSelect('receiver')}
              style={[
                styles.roleCard,
                selectedRole === 'receiver' && styles.roleCardActive,
              ]}
            >
              <View style={styles.roleCardHeader}>
                <View
                  style={[
                    styles.roleIconCircle,
                    { backgroundColor: selectedRole === 'receiver' ? colors.statusAccepted : colors.surfaceSubtle },
                  ]}
                >
                  <Ionicons
                    name="hand-left"
                    size={24}
                    color={selectedRole === 'receiver' ? '#ffffff' : colors.statusAccepted}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.roleName}>Food Receiver</Text>
                  <Text style={styles.roleTag}>NGO / Shelter Home / Community Volunteer</Text>
                </View>
                {selectedRole === 'receiver' && (
                  <Ionicons name="checkmark-circle" size={22} color={colors.statusAccepted} />
                )}
              </View>

              <Text style={styles.roleDetail}>
                Browse nearby donations on the radar map, calculate distances, and request food pickups for needy people.
              </Text>

              <CustomButton
                title="Enter as Food Receiver ➔"
                size="small"
                variant={selectedRole === 'receiver' ? 'primary' : 'outline'}
                loading={isSubmitting && selectedRole === 'receiver'}
                onPress={() => handleDirectEnter('receiver')}
                style={{ marginTop: 10 }}
              />
            </Pressable>
          </View>

          {/* Optional Profile Customization */}
          <View style={styles.demoProfileBox}>
            <Text style={styles.demoProfileTitle}>
              Customize Demo Contact Info ({selectedRole === 'donor' ? 'Donor' : 'Receiver'})
            </Text>
            <CustomInput
              label="Contact Person Name"
              value={name}
              onChangeText={setName}
              placeholder="e.g. John Doe"
            />
            <CustomInput
              label={selectedRole === 'donor' ? 'Restaurant / Organization Name' : 'NGO / Shelter Name'}
              value={organization}
              onChangeText={setOrganization}
              placeholder="e.g. Green Leaf Bistro"
            />
            <CustomInput
              label="Contact Phone"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="+91 98765 43210"
            />
          </View>

          <CustomButton
            title={`Continue as ${selectedRole === 'donor' ? 'Food Donor' : 'Food Receiver'}`}
            onPress={() => handleDirectEnter(selectedRole)}
            loading={isSubmitting}
            size="large"
            style={{ marginTop: 8 }}
          />

          <Text style={styles.demoNote}>
            No password or registration required for this college demonstration. You can also switch roles anytime inside the app.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: 18,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginVertical: 14,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryDark,
    marginTop: 4,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  quickAccessBar: {
    backgroundColor: colors.primaryFaint,
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  quickAccessLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 8,
  },
  quickAccessButtons: {
    flexDirection: 'row',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 14,
    marginTop: 2,
  },
  roleGrid: {
    gap: 12,
    marginBottom: 14,
  },
  roleCard: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    backgroundColor: colors.surface,
    cursor: Platform.OS === 'web' ? 'pointer' : 'default',
  },
  roleCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryFaint,
  },
  roleCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  roleTag: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 1,
  },
  roleDetail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    lineHeight: 16,
  },
  demoProfileBox: {
    backgroundColor: colors.surfaceSubtle,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  demoProfileTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  demoNote: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
});

export default OnboardingScreen;
