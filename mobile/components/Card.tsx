import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

interface CardProps extends ViewProps {}

export function Card({ children, style, ...props }: CardProps) {
  return (
    <Animated.View
      entering={FadeIn}
      style={[styles.card, style]}
      {...props}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3
  }
});