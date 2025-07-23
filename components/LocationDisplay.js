// components/LocationDisplay.js
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import Toast from 'react-native-toast-message';
import { AntDesign } from '@expo/vector-icons';

export default function LocationDisplay() {
  const [locationText, setLocationText] = useState('Fetching location...');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchLocation = async () => {
    setLoading(true);
    setError(false);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({
          type: 'error',
          text1: 'Permission Denied',
          text2: 'Location access is required to show your city.',
        });
        setLocationText('Permission denied');
        setError(true);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const reverseGeocode = await Location.reverseGeocodeAsync(loc.coords);

      if (reverseGeocode?.length > 0) {
        const { city, district, region } = reverseGeocode[0];
        const formatted = `${city || district || 'Unknown'}, ${region || ''}`;
        setLocationText(formatted);
      } else {
        setLocationText('Location not found');
        setError(true);
      }
    } catch (err) {
      console.error('Location error:', err);
      setLocationText('Error fetching location');
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  return (
    <TouchableOpacity style={styles.container} onPress={fetchLocation}>
      <AntDesign name="enviromento" size={20} color="#f05" />
      {loading ? (
        <ActivityIndicator size="small" color="#888" style={{ marginLeft: 8 }} />
      ) : (
        <Text style={[styles.text, error && { color: 'gray' }]}>
          {locationText}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingVertical: 10,
  },
  text: {
    marginLeft: 8,
    fontSize: 15,
    color: '#333',
  },
});
