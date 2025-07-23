import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import {
  collection,
  addDoc,
  serverTimestamp,
  getDoc,
  doc,
} from 'firebase/firestore';
import { db, auth, storage } from './firebaseConfig';
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import Toast from 'react-native-toast-message'; // ✅ Import toast

const UploadScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [gender, setGender] = useState('');
  const [location, setLocation] = useState('');
  const [imageUris, setImageUris] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [isSeller, setIsSeller] = useState(null);

  useEffect(() => {
    const checkSellerStatus = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Toast.show({
          type: 'info',
          text1: 'Login Required',
          text2: 'Please login to upload a product.',
        });
        navigation.navigate('LoginScreen');
        return;
      }

      try {
        const docRef = doc(db, 'sellers', currentUser.uid);
        const docSnap = await getDoc(docRef);
        setIsSeller(docSnap.exists());
      } catch (error) {
        console.error('Error checking seller:', error);
        setIsSeller(false);
      }
    };

    checkSellerStatus();
  }, []);

  const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: true,
        quality: 0.7,
        selectionLimit: 5,
      });

      if (!result.canceled && result.assets.length > 0) {
        const selectedUris = result.assets.map((asset) => asset.uri);
        const combined = [...imageUris, ...selectedUris].slice(0, 5);
        setImageUris(combined);
      }
    } catch (error) {
      console.error("Image picking failed:", error);
      Toast.show({
        type: 'error',
        text1: 'Error picking images',
      });
    }
  };

  const handleUpload = async () => {
    if (!name || !price || !category || !gender || !location || imageUris.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Fill all fields and select at least one image.',
      });
      return;
    }

    try {
      setUploading(true);
      const sellerId = auth.currentUser?.uid;
      const imageUrls = [];

      for (const uri of imageUris) {
        const response = await fetch(uri);
        const blob = await response.blob();

        const filename = `products/${Date.now()}_${Math.random().toString(36).substring(2)}.jpg`;
        const storageRef = ref(storage, filename);
        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);
        imageUrls.push(downloadURL);
      }

      await addDoc(collection(db, 'clothes'), {
        name,
        price: parseFloat(price),
        category,
        gender,
        location,
        images: imageUrls,
        sellerId,
        timestamp: serverTimestamp(),
      });

      Toast.show({
        type: 'success',
        text1: '✅ Product Uploaded',
      });

      // Reset form
      setName('');
      setPrice('');
      setCategory('');
      setGender('');
      setLocation('');
      setImageUris([]);
    } catch (error) {
      console.error('Upload error:', error);
      Toast.show({
        type: 'error',
        text1: 'Upload Failed',
        text2: 'Something went wrong while uploading.',
      });
    } finally {
      setUploading(false);
    }
  };

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

      <TouchableOpacity onPress={pickImages} style={styles.imageBox}>
        {imageUris.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {imageUris.map((uri, index) => (
              <Image key={index} source={{ uri }} style={styles.previewImage} />
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.placeholderText}>Tap to select images</Text>
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholderTextColor="gray"
        placeholder="Product Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Price"
        placeholderTextColor="gray"
        keyboardType="numeric"
        value={price}
        onChangeText={setPrice}
      />
      <TextInput
        style={styles.input}
        placeholderTextColor="gray"
        placeholder="Category (e.g., T-Shirts, Dresses)"
        value={category}
        onChangeText={setCategory}
      />
      <TextInput
        style={styles.input}
        placeholderTextColor="gray"
        placeholder="Gender (Her, Him, Ministyle)"
        value={gender}
        onChangeText={setGender}
      />
      <TextInput
        style={styles.input}
        placeholderTextColor="gray"
        placeholder="Location (e.g., Kohima)"
        value={location}
        onChangeText={setLocation}
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

      <Toast /> {/* ✅ Show Toast Component */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 50,
    alignItems: 'center',
    backgroundColor: '#DBDBD0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 30,
  },
  imageBox: {
    width: '100%',
    height: 160,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    justifyContent: 'center',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  previewImage: {
    width: 140,
    height: 140,
    borderRadius: 10,
    marginRight: 10,
  },
  placeholderText: {
    color: 'black',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: 'white',
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
