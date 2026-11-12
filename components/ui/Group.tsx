import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useAppTheme, space, radius } from '../../theme';

/** A rounded box around a few settings rows (design.md: grouped settings get a card). */
export const Group: React.FC<{ children: React.ReactNode; style?: ViewStyle }> = ({ children, style }) => {
  const theme = useAppTheme();
  return (
    <View style={[styles.group, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  group: {
    marginHorizontal: space.lg,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
});
