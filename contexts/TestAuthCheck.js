// TestAuthCheck.js
import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { auth } from '../screens/firebaseConfig';

export default function TestAuthCheck() {
  useEffect(() => {
    console.log('auth:', auth);
    console.log('user:', auth.currentUser);
  }, []);

  return (
    <View>
      <Text>Testing Auth</Text>
    </View>
  );
}
