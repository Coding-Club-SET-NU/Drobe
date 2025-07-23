import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons'; // ✅ AntDesign imported
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { AuthContext } from '../contexts/AuthContext';
import Toast from 'react-native-toast-message';

export default function EditProfileScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setName(data.name || '');
        setAddress(data.address || '');
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      Toast.show({
        type: 'error',
        text1: 'Error fetching profile',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!name.trim() || !address.trim()) {
      Toast.show({
        type: 'info',
        text1: 'Please fill in all fields',
      });
      return;
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        name,
        address,
      });
      Toast.show({
        type: 'success',
        text1: 'Profile updated successfully!',
      });
      navigation.goBack();
    } catch (err) {
      console.error('Failed to save profile:', err);
      Toast.show({
        type: 'error',
        text1: 'Something went wrong',
        text2: 'Please try again',
      });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#000" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <View style={styles.titleWithIcon}>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <AntDesign name="edit" size={20} color="#000" style={{ marginLeft: 6 }} />
        </View>

        <View style={{ width: 24 }} />
      </View>

      {/* Input Fields */}
      <View style={styles.form}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
          placeholderTextColor="gray"
          style={styles.input}
        />

        <Text style={styles.label}>Address</Text>
        <TextInput
          value={address}
          onChangeText={setAddress}
          placeholder="Enter your address"
          placeholderTextColor="gray"
          multiline
          style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
        />

        <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DBDBD0',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  form: {
    marginTop: 30,
  },
  label: {
    fontSize: 16,
    color: '#555',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 14,
    fontSize: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  saveButton: {
    backgroundColor: 'grey',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
