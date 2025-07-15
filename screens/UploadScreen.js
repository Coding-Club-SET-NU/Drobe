// screens/UploadScreen.js

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import {
  collection,
  addDoc,
  serverTimestamp,
  getDoc,
  doc,
} from 'firebase/firestore';
import { db, auth, storage } from './firebase'; // ✅ Must include storage
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';

const UploadScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [gender, setGender] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isSeller, setIsSeller] = useState(null); // null means loading

  useEffect(() => {
    const checkSellerStatus = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert(
          'Login Required',
          'Please login to upload a product.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Login', onPress: () => navigation.navigate('LoginScreen') },
          ]
        );
        return;
      }

      try {
        const docRef = doc(db, 'sellers', currentUser.uid);
        const docSnap = await getDoc(docRef);
        setIsSeller(docSnap.exists()); // true if seller document exists
      } catch (error) {
        console.error('Error checking seller:', error);
        setIsSeller(false);
      }
    };

    checkSellerStatus();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleUpload = async () => {
    if (!name || !price || !category || !gender || !imageUri) {
      Alert.alert('Please fill all fields and select an image');
      return;
    }

    try {
      setUploading(true);
      const sellerId = auth.currentUser?.uid;

      // Convert image URI to blob
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Upload image to Firebase Storage
      const filename = `${Date.now()}_${name}.jpg`;
      const storageRef = ref(storage, `products/${filename}`);
      await uploadBytes(storageRef, blob);

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);

      // Save product data to Firestore
      await addDoc(collection(db, 'clothes'), {
        name,
        price: parseFloat(price),
        category,
        gender,
        image: downloadURL,
        sellerId,
        timestamp: serverTimestamp(),
      });

      Alert.alert('✅ Product Uploaded');
      setName('');
      setPrice('');
      setCategory('');
      setGender('');
      setImageUri(null);
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error uploading item');
    } finally {
      setUploading(false);
    }
  };

  // Loading or non-seller message
  if (isSeller === null) {
    return (
      <View style={styles.container}>
        <Text>Checking seller information...</Text>
      </View>
    );
  }

  if (!isSeller) {
    return (
      <View style={styles.container}>
        <Text style={{ fontSize: 16, textAlign: 'center', color: 'gray' }}>
          🚫 You are not a registered seller.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Upload Product</Text>

      <TouchableOpacity onPress={pickImage} style={styles.imageBox}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <Text style={styles.placeholderText}>Tap to select image</Text>
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Product Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Price"
        keyboardType="numeric"
        value={price}
        onChangeText={setPrice}
      />
      <TextInput
        style={styles.input}
        placeholder="Category (e.g., T-Shirts)"
        value={category}
        onChangeText={setCategory}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Gender (Her, Him, Ministyle)"
        value={gender}
        onChangeText={setGender}
      />

      <TouchableOpacity
        style={[styles.uploadButton, uploading && { opacity: 0.6 }]}
        onPress={handleUpload}
        disabled={uploading}
      >
        <Text style={styles.uploadText}>
          {uploading ? 'Uploading...' : 'Upload Product'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#DBDBD0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  imageBox: {
    width: 160,
    height: 160,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  placeholderText: {
    color: '#88',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  input: {
    width: '100%',
    backgroundColor: '#8888',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  uploadButton: {
    backgroundColor: '#464642ff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginTop: 10,
  },
  uploadText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default UploadScreen;
