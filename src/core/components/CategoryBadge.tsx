import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Category } from '@features/category/types/Category';
import { ColorUtils } from '@core/utils/ColorUtils';
import { Typography, Spacing, BorderRadius } from '@core/theme';

interface CategoryBadgeProps {
  category: Category;
  size?: 'small' | 'medium';
}

export function CategoryBadge({ category, size = 'medium' }: CategoryBadgeProps) {
  const textColor = ColorUtils.contrastingTextColor(category.colorHex);
  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: category.colorHex },
        isSmall && styles.small,
      ]}
    >
      <Text
        style={[
          isSmall ? Typography.labelSmall : Typography.labelMedium,
          { color: textColor },
        ]}
        numberOfLines={1}
      >
        {category.name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    alignSelf: 'flex-start',
  },
  small: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
  },
});
