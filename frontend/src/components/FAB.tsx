import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, FontSize, Spacing, Radius } from '../theme';

interface Props {
  onPress:  () => void;
  label?:   string;
  icon?:    keyof typeof Ionicons.glyphMap;
  style?:   ViewStyle;
  variant?: 'primary' | 'secondary';
}

export default function FAB({
  onPress, label, icon = 'add', style, variant = 'primary',
}: Props) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity
      style={[styles.fab, variant === 'secondary' && styles.fabSecondary, style]}
      onPress={handlePress}
      activeOpacity={0.85}
    >
      <Ionicons
        name={icon}
        size={22}
        color={variant === 'primary' ? Colors.textInverse : Colors.chord}
      />
      {label && (
        <Text style={[styles.label, variant === 'secondary' && styles.labelSecondary]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    shadowColor: Colors.chord,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  fabSecondary: {
    backgroundColor: Colors.surfaceRaised,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.2,
  },
  label: {
    fontFamily: Typography.uiBoldFamily,
    fontSize: FontSize.sm,
    color: Colors.textInverse,
    letterSpacing: 0.3,
  },
  labelSecondary: { color: Colors.chord },
});
