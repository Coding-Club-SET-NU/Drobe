import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { AuthContext } from '../contexts/AuthContext';
import Toast from 'react-native-toast-message';

export default function SellerRegistrationScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [fullName, setFullName] = useState('');
  const [shopName, setShopName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const handleRegister = async () => {
    if (!fullName || !shopName || !phone) {
      Toast.show({
        type: 'error',
        text1: 'Required',
        text2: 'Please fill in all required fields',
      });
      return;
    }

    try {
      const sellerRef = doc(db, 'sellers', user.uid);
      await setDoc(sellerRef, {
        uid: user.uid,
        fullName,
        shopName,
        phone,
        address,
        createdAt: new Date(),
      });

      Toast.show({
        type: 'success',
        text1: 'Registration Successful',
        text2: 'You are now registered as a seller',
      });

      navigation.replace('SellerDashboard');
    } catch (error) {
      console.error('❌ Registration error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not register. Try again later.',
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Become a Seller</Text>

      <TextInput
        placeholder="Full Name"
        placeholderTextColor="grey"
        value={fullName}
        onChangeText={setFullName}
        style={styles.input}
      />
      <TextInput
        placeholder="Business Name"
        placeholderTextColor="grey"
        value={shopName}
        onChangeText={setShopName}
        style={styles.input}
      />
      <TextInput
        placeholder="Phone Number"
        placeholderTextColor="grey"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        style={styles.input}
      />
      <TextInput
        placeholder="Address"
        placeholderTextColor="grey"
        value={address}
        onChangeText={setAddress}
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register as Seller</Text>
      </TouchableOpacity>

      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DBDBD0',
    padding: 20,
    marginTop: 29,
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
    backgroundColor: 'grey',
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
