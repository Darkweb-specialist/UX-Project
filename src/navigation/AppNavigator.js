import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import OnboardingScreen from '../screens/OnboardingScreen';
import DonationDetailsScreen from '../screens/DonationDetailsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import colors from '../theme/colors';
import { useApp } from '../context/AppContext';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const { isLoading, isOnboarded } = useApp();

  if (isLoading) {
    return (
      <View style={styles.splashContainer}>
        <View style={styles.splashLogo}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
        <Text style={styles.splashTitle}>Smart Food Rescue</Text>
        <Text style={styles.splashSub}>Loading surplus food network...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isOnboarded ? 'MainTabs' : 'Onboarding'}
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen
          name="DonationDetails"
          component={DonationDetailsScreen}
          options={{
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="EditProfile"
          component={EditProfileScreen}
          options={{
            animation: 'slide_from_right',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primaryFaint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  splashTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  splashSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 6,
  },
});

export default AppNavigator;
