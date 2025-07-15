import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase'; // ✅ corrected path if firebaseConfig.js is in root

const SellerRegistration = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');

  const handleSubmit = async () => {
    const auth = getAuth(); // ✅ call getAuth() only once here
    const user = auth.currentUser;

    if (!user) {
      Alert.alert('Error', 'You must be logged in.');
      return;
    }

    if (!name || !phone || !businessName) {
      Alert.alert('Missing info', 'Please fill in all fields.');
      return;
    }

    try {
      await addDoc(collection(db, 'seller_requests'), {
        userId: user.uid,
        email: user.email,
        name,
        phone,
        businessName,
        timestamp: serverTimestamp(),
      });

      Alert.alert('Request sent', 'We’ll get back to you soon!');
      setName('');
      setPhone('');
      setBusinessName('');
    } catch (err) {
      console.error('Error sending request:', err);
      Alert.alert('Error', 'Could not send request');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Become a Seller</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <TextInput
        style={styles.input}
        placeholder="Business Name"
        value={businessName}
        onChangeText={setBusinessName}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit Request</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#DBDBD0',
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 14,
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default SellerRegistration;
