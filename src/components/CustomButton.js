import React, { useRef } from 'react';
import { Pressable, Text, StyleSheet, Animated, ActivityIndicator, View } from 'react-native';
import colors from '../theme/colors';

export const CustomButton = ({
  title,
  onPress,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger'
  size = 'medium',    // 'small' | 'medium' | 'large'
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();
  };

  // Determine button colors
  let buttonBg = colors.primary;
  let textColor = colors.textOnPrimary;
  let borderWidth = 0;
  let borderColor = 'transparent';

  if (variant === 'secondary') {
    buttonBg = colors.surfaceSubtle;
    textColor = colors.textPrimary;
  } else if (variant === 'outline') {
    buttonBg = 'transparent';
    textColor = colors.primary;
    borderWidth = 1.5;
    borderColor = colors.primary;
  } else if (variant === 'danger') {
    buttonBg = colors.error;
    textColor = colors.textOnPrimary;
  }

  if (disabled) {
    buttonBg = colors.border;
    textColor = colors.textMuted;
    borderColor = colors.border;
  }

  // Size styles
  let paddingVertical = 12;
  let paddingHorizontal = 18;
  let fontSize = 15;

  if (size === 'small') {
    paddingVertical = 8;
    paddingHorizontal = 12;
    fontSize = 13;
  } else if (size === 'large') {
    paddingVertical = 16;
    paddingHorizontal = 24;
    fontSize = 17;
  }

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[
          styles.button,
          {
            backgroundColor: buttonBg,
            paddingVertical,
            paddingHorizontal,
            borderWidth,
            borderColor,
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={textColor} size="small" />
        ) : (
          <View style={styles.contentRow}>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text style={[styles.text, { color: textColor, fontSize }, textStyle]}>
              {title}
            </Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  text: {
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default CustomButton;
