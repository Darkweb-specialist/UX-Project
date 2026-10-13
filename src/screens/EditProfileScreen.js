import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import colors from '../theme/colors';
import Header from '../components/Header';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { useApp } from '../context/AppContext';

export const EditProfileScreen = ({ navigation }) => {
  const { role, profile, updateProfile } = useApp();

  const [name, setName] = useState(profile?.name || '');
  const [organization, setOrganization] = useState(profile?.organization || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [address, setAddress] = useState(profile?.address || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required Field', 'Please enter your name.');
      return;
    }

    try {
      setIsSaving(true);
      const success = await updateProfile({
        name: name.trim(),
        organization: organization.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
      });

      if (success) {
        Alert.alert('Success', 'Profile updated successfully.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Error', 'Failed to update profile.');
      }
    } catch (e) {
      Alert.alert('Error', 'An error occurred while saving profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Edit Profile" showRoleSwitch={false} />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>
          <CustomInput
            label="Full Name *"
            value={name}
            onChangeText={setName}
            placeholder="e.g. John Doe"
          />

          <CustomInput
            label={role === 'donor' ? 'Organization / Restaurant' : 'NGO / Shelter Name'}
            value={organization}
            onChangeText={setOrganization}
            placeholder="e.g. Hope Community Kitchen"
          />

          <CustomInput
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="+91 98765 43210"
          />

          <CustomInput
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="user@example.com"
          />

          <CustomInput
            label="Primary Address"
            value={address}
            onChangeText={setAddress}
            placeholder="Full street address and city"
            multiline
            numberOfLines={2}
          />

          <View style={styles.buttonRow}>
            <CustomButton
              title="Cancel"
              variant="secondary"
              onPress={() => navigation.goBack()}
              style={{ flex: 1, marginRight: 8 }}
            />
            <CustomButton
              title="Save Changes"
              onPress={handleSave}
              loading={isSaving}
              style={{ flex: 1, marginLeft: 8 }}
            />
          </View>
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
    padding: 16,
  },
  formCard: {
    backgroundColor: colors.surface,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
});

export default EditProfileScreen;
