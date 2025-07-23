import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { auth, db } from './firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

const MyShop = () => {
  const navigation = useNavigation();
  const [products, setProducts] = useState([]);
  const [sellerInfo, setSellerInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    shopName: '',
    phone: '',
  });

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      fetchSellerInfo(currentUser.uid);
      fetchSellerProducts(currentUser.uid);
    } else {
      Toast.show({
        type: 'info',
        text1: 'Not signed in',
        text2: 'Please log in to view your shop.',
      });
    }
  }, []);

  const fetchSellerInfo = async (uid) => {
    try {
      const docRef = doc(db, 'sellers', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSellerInfo(data);
        setForm({
          fullName: data.fullName || '',
          shopName: data.shopName || '',
          phone: data.phone || '',
        });
      }
    } catch (err) {
      console.error('Seller info error:', err);
    }
  };

  const fetchSellerProducts = async (uid) => {
    try {
      const q = query(collection(db, 'clothes'), where('sellerId', '==', uid));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(list);
    } catch (err) {
      console.error('Fetch products error:', err);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not load products',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      const uid = auth.currentUser.uid;
      const docRef = doc(db, 'sellers', uid);
      await setDoc(docRef, form, { merge: true });
      setSellerInfo(form);
      setEditing(false);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Seller details updated!',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update seller details.',
      });
      console.error(error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.productCard}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productPrice}>₹{item.price}</Text>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>My Shop</Text>

      {sellerInfo && (
        <View style={styles.sellerInfo}>
          {editing ? (
            <>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={form.fullName}
                onChangeText={text => handleChange('fullName', text)}
              />

              <Text style={styles.inputLabel}>Shop Name</Text>
              <TextInput
                style={styles.input}
                value={form.shopName}
                onChangeText={text => handleChange('shopName', text)}
              />

              <Text style={styles.inputLabel}>Phone</Text>
              <TextInput
                style={styles.input}
                value={form.phone}
                keyboardType="phone-pad"
                onChangeText={text => handleChange('phone', text)}
              />

              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setForm({
                    fullName: sellerInfo.fullName || '',
                    shopName: sellerInfo.shopName || '',
                    phone: sellerInfo.phone || '',
                  });
                  setEditing(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.label}>🧍 Seller: {sellerInfo.fullName || '—'}</Text>
              <Text style={styles.label}>🏬 Shop: {sellerInfo.shopName || '—'}</Text>
              <Text style={styles.label}>📞 Phone: {sellerInfo.phone || '—'}</Text>

              <TouchableOpacity style={styles.editButton} onPress={() => setEditing(true)}>
                <Text style={styles.editButtonText}>Edit Details</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.addProductButton}
                onPress={() => navigation.navigate('Main', { screen: 'Upload' })}
              >
                <Text style={styles.addProductButtonText}>+ Add New Product</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      <Text style={styles.sectionTitle}>🛍 My Products</Text>

      {loading ? (
        <Text>Loading...</Text>
      ) : products.length === 0 ? (
        <Text style={{ marginTop: 10 }}>You haven't uploaded any products yet.</Text>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={styles.productList}
        />
      )}

      <Toast />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // ... (unchanged styles)
  // You can retain all your original styles
});

export default MyShop;
