import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebaseConfig';
import Toast from 'react-native-toast-message';

const SellerRegistration = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');

  const handleSubmit = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      Toast.show({
        type: 'error',
        text1: 'You must be logged in.',
      });
      return;
    }

    if (!name || !phone || !businessName) {
      Toast.show({
        type: 'info',
        text1: 'Please fill all details',
      });
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

      Toast.show({
        type: 'success',
        text1: 'Request sent',
        text2: 'We’ll get back to you soon!',
      });

      setName('');
      setPhone('');
      setBusinessName('');
    } catch (err) {
      console.error('Error sending request:', err);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not send request',
      });
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

      <Toast />
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
