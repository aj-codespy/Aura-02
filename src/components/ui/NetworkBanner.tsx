import { Ionicons } from '@expo/vector-icons';
import * as Network from 'expo-network';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../theme';

export const NetworkBanner = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    checkNetwork();
    const interval = setInterval(checkNetwork, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const checkNetwork = async () => {
    try {
      const networkState = await Network.getNetworkStateAsync();

      // Show banner if not on WiFi (cellular, unknown, or no connection)
      const isOnWifi = networkState.type === Network.NetworkStateType.WIFI;
      const isConnected = networkState.isConnected === true;
      setShowBanner(!isOnWifi && isConnected);
    } catch (error) {
      console.error('Network check failed:', error);
      setShowBanner(false);
    }
  };

  if (!showBanner) {
    return null;
  }

  return (
    <View style={styles.banner}>
      <Ionicons name="warning" size={16} color="#FFF" />
      <Text style={styles.text}>
        Local control requires Wi-Fi. Please connect to your home network.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  text: {
    flex: 1,
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
