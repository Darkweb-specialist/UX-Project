import React, { useRef } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';

export const SwipeableCard = ({ children, onQuickAction, quickActionLabel = 'Details', quickActionIcon = 'arrow-forward' }) => {
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only capture horizontal gestures
        return Math.abs(gestureState.dx) > 15 && Math.abs(gestureState.dy) < 15;
      },
      onPanResponderMove: (_, gestureState) => {
        // Allow swiping left (negative dx) up to -90px
        if (gestureState.dx < 0 && gestureState.dx > -110) {
          pan.x.setValue(gestureState.dx);
        } else if (gestureState.dx >= 0) {
          pan.x.setValue(0);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -50) {
          // Snap open
          Animated.spring(pan.x, {
            toValue: -90,
            useNativeDriver: false,
            bounciness: 4,
          }).start();
        } else {
          // Snap closed
          Animated.spring(pan.x, {
            toValue: 0,
            useNativeDriver: false,
            bounciness: 4,
          }).start();
        }
      },
    })
  ).current;

  const closeSwipe = () => {
    Animated.spring(pan.x, {
      toValue: 0,
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={styles.container}>
      {/* Background Action Button revealed on swipe */}
      <View style={styles.backgroundAction}>
        <Pressable
          onPress={() => {
            closeSwipe();
            if (onQuickAction) onQuickAction();
          }}
          style={styles.actionButton}
        >
          <Ionicons name={quickActionIcon} size={20} color="#ffffff" />
          <Text style={styles.actionText}>{quickActionLabel}</Text>
        </Pressable>
      </View>

      {/* Foreground card attached to PanResponder */}
      <Animated.View
        style={[
          styles.foregroundCard,
          {
            transform: [{ translateX: pan.x }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginVertical: 4,
  },
  backgroundAction: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 16,
    width: 90,
    backgroundColor: colors.primaryDark,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  actionButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  actionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  foregroundCard: {
    zIndex: 2,
    backgroundColor: 'transparent',
  },
});

export default SwipeableCard;
