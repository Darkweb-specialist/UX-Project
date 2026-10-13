import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import colors from '../theme/colors';

export const CustomInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  helperText,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  editable = true,
  icon,
  style,
  inputStyle,
  autoCapitalize = 'sentences',
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputFocused,
          error && styles.inputError,
          multiline && { minHeight: 90, alignItems: 'flex-start' },
        ]}
      >
        {icon && <View style={styles.iconBox}>{icon}</View>}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            styles.textInput,
            multiline && { textAlignVertical: 'top', paddingTop: 10 },
            inputStyle,
          ]}
        />
      </View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: '#ffffff',
  },
  inputError: {
    borderColor: colors.error,
  },
  iconBox: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.textPrimary,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  helperText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
});

export default CustomInput;
