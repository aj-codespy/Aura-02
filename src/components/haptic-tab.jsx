import React from 'react';
import { Pressable } from 'react-native';

// This component replaces the default TabBar button to add haptic feedback.
// Since we don't have expo-haptics installed, we use a simple Pressable.
export function HapticTab(props) {
  return (
    <Pressable
      {...props}
      style={[{ flex: 1 }]}
      // onPress={handleHaptic} // Placeholder for Haptics logic
    />
  );
}