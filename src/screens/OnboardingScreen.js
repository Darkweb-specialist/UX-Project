import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import { useApp } from '../context/AppContext';

export const OnboardingScreen = ({ navigation }) => {
  const { completeOnboarding, updateProfile } = useApp();
  const [selectedRole, setSelectedRole] = useState('donor');
  const [name, setName] = useState('Ananya Sharma');
  const [organization, setOrganization] = useState('Green Leaf Bistro');
  const [phone, setPhone] = useState('+91 98765 43210');

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    if (role === 'donor') {
      setName('Ananya Sharma');
      setOrganization('Green Leaf Bistro');
      setPhone('+91 98765 43210');
    } else {
      setName('Rajesh Varma');
      setOrganization('Hope For All NGO');
      setPhone('+91 98450 78901');
    }
  };

  const handleGetStarted = async () => {
    await updateProfile({
      name: name || (selectedRole === 'donor' ? 'Chef Donor' : 'Rescue Volunteer'),
      organization: organization || (selectedRole === 'donor' ? 'Local Restaurant' : 'Food Bank NGO'),
      phone: phone || '+91 99999 12345',
      role: selectedRole,
    });
    await completeOnboarding(selectedRole);
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
            Reduce food waste. Restaurants and shops can donate fresh surplus meals, and NGOs can pick them up quickly.
          </Text>
        </View>

        {/* Role Selection Box */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Select Your Role</Text>
          <Text style={styles.sectionSubtitle}>
            How would you like to participate in today's demo?
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
              <Text style={styles.roleName}>Food Donor</Text>
              <Text style={styles.roleDetail}>
                Restaurant, Hotel, Caterer, Grocery, or Individual with surplus food.
              </Text>
              {selectedRole === 'donor' && (
                <View style={styles.activeCheck}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                </View>
              )}
            </Pressable>

            {/* Receiver Option */}
            <Pressable
              onPress={() => handleRoleSelect('receiver')}
              style={[
                styles.roleCard,
                selectedRole === 'receiver' && styles.roleCardActive,
              ]}
            >
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
              <Text style={styles.roleName}>Food Receiver</Text>
              <Text style={styles.roleDetail}>
                NGO, Volunteer, Shelter Home, or Community Kitchen requesting meals.
              </Text>
              {selectedRole === 'receiver' && (
                <View style={styles.activeCheck}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.statusAccepted} />
                </View>
              )}
            </Pressable>
          </View>

          {/* Quick Demo Profile Details */}
          <View style={styles.demoProfileBox}>
            <Text style={styles.demoProfileTitle}>Demo User Profile</Text>
            <CustomInput
              label="Contact Person Name"
              value={name}
              onChangeText={setName}
              placeholder="e.g. John Doe"
            />
            <CustomInput
              label={selectedRole === 'donor' ? 'Business / Restaurant Name' : 'NGO / Shelter Name'}
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
            title={`Enter as ${selectedRole === 'donor' ? 'Donor' : 'Receiver'}`}
            onPress={handleGetStarted}
            size="large"
            style={{ marginTop: 8 }}
          />

          <Text style={styles.demoNote}>
            For this student project demonstration, no password is required. You can freely switch roles at any time.
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
    padding: 20,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginVertical: 16,
  },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
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
    marginTop: 8,
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 18,
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
    fontWeight: '700',
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
    marginBottom: 16,
  },
  roleCard: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    position: 'relative',
    backgroundColor: colors.surface,
  },
  roleCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryFaint,
  },
  roleIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  roleName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  roleDetail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  activeCheck: {
    position: 'absolute',
    top: 12,
    right: 12,
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
    marginTop: 12,
    fontStyle: 'italic',
  },
});

export default OnboardingScreen;
