import React from 'react';
import { ScrollView, Pressable, Text, StyleSheet } from 'react-native';
import colors from '../theme/colors';

export const CategoryPill = ({ categories, selectedCategory, onSelectCategory }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {categories.map((cat) => {
        const isSelected = selectedCategory === cat;
        return (
          <Pressable
            key={cat}
            onPress={() => onSelectCategory(cat)}
            style={({ pressed }) => [
              styles.pill,
              isSelected && styles.pillSelected,
              pressed && { opacity: 0.8 },
            ]}
          >
            <Text
              style={[
                styles.pillText,
                isSelected && styles.pillTextSelected,
              ]}
            >
              {cat}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 6,
  },
  pillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  pillTextSelected: {
    color: '#ffffff',
  },
});

export default CategoryPill;
