import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import HomeScreen from '../screens/HomeScreen';
import DonateScreen from '../screens/DonateScreen';
import NearbyScreen from '../screens/NearbyScreen';
import PickupsScreen from '../screens/PickupsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { useApp } from '../context/AppContext';

const Tab = createBottomTabNavigator();

export const TabNavigator = () => {
  const { pickups } = useApp();

  // Active pickups count for badge
  const activeCount = pickups.filter(
    (p) => p.status === 'Requested' || p.status === 'Accepted'
  ).length;

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Donate') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
            size = 28; // slightly prominent donate icon
          } else if (route.name === 'Nearby') {
            iconName = focused ? 'navigate' : 'navigate-outline';
          } else if (route.name === 'My Pickups') {
            iconName = focused ? 'bicycle' : 'bicycle-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size || 22} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Donate"
        component={DonateScreen}
        options={{ tabBarLabel: 'Donate' }}
      />
      <Tab.Screen
        name="Nearby"
        component={NearbyScreen}
        options={{ tabBarLabel: 'Nearby' }}
      />
      <Tab.Screen
        name="My Pickups"
        component={PickupsScreen}
        options={{
          tabBarLabel: 'Pickups',
          tabBarBadge: activeCount > 0 ? activeCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.warning,
            color: '#ffffff',
            fontSize: 10,
            fontWeight: '700',
          },
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
