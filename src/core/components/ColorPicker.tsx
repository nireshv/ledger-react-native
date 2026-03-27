import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ColorUtils } from '@core/utils/ColorUtils';
import { Spacing, BorderRadius } from '@core/theme';

interface ColorPickerProps {
  selected: string;
  onSelect: (color: string) => void;
}

export function ColorPicker({ selected, onSelect }: ColorPickerProps) {
  const palette = ColorUtils.palette();

  return (
    <View style={styles.grid}>
      {palette.map((color) => (
        <TouchableOpacity
          key={color}
          style={[
            styles.swatch,
            { backgroundColor: color },
            selected === color && styles.selected,
          ]}
          onPress={() => onSelect(color)}
          activeOpacity={0.8}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
  },
  selected: {
    borderWidth: 3,
    borderColor: '#000000',
    transform: [{ scale: 1.1 }],
  },
});
