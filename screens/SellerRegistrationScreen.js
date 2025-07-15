import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { AuthContext } from '../contexts/AuthContext';

export default function SellerRegistrationScreen({ navigation }) {
  const { user } = useContext(AuthContext);

  const [fullName, setFullName] = useState('');
  const [shopName, setShopName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const handleRegister = async () => {
    if (!fullName || !shopName || !phone) {
      Alert.alert('Required', 'Please fill in all required fields');
      return;
    }

    try {
      const sellerRef = doc(db, 'sellers', user.uid);
      await setDoc(sellerRef, {
        fullName,
        shopName,
        phone,
        address,
        uid: user.uid,
        createdAt: new Date(),
      });

      Alert.alert('Success', 'You are now registered as a seller');
      navigation.replace('SellerDashboard');
    } catch (error) {
      console.error('❌ Registration error:', error);
      Alert.alert('Error', 'Could not register. Try again later.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Become a Seller</Text>

      <TextInput
        placeholder="Full Name"
        value={fullName}
        onChangeText={setFullName}
        style={styles.input}
      />
      <TextInput
        placeholder="Business Name"
        value={shopName}
        onChangeText={setShopName}
        style={styles.input}
      />
      <TextInput
        placeholder="Phone Number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        style={styles.input}
      />
      <TextInput
        placeholder="Address (optional)"
        value={address}
        onChangeText={setAddress}
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register as Seller</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DBDBD0',
    padding: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  button: {
    backgroundColor: 'brown',
    padding: 14,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
