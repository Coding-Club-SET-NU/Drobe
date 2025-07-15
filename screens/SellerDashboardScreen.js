// screens/SellerDashboardScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { auth, db } from './firebase'; // ✅ Make sure you're importing both
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

export default function SellerDashboardScreen({ navigation }) {
  const [sellerInfo, setSellerInfo] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      fetchSellerInfo(currentUser.uid);
      fetchSellerProducts(currentUser.uid);
    }
  }, []);

  const fetchSellerInfo = async (uid) => {
    try {
      const docRef = doc(db, 'sellers', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSellerInfo(docSnap.data());
      } else {
        Alert.alert('Not a seller', 'No seller info found.');
      }
    } catch (err) {
      console.error('❌ Error fetching seller info:', err);
      Alert.alert('Error', 'Failed to fetch seller info.');
    }
  };

  const fetchSellerProducts = async (uid) => {
    try {
      const q = query(collection(db, 'clothes'), where('sellerId', '==', uid));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(items);
    } catch (err) {
      console.error('❌ Error fetching products:', err);
      Alert.alert('Error', 'Failed to fetch your products.');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: item.image || 'https://via.placeholder.com/100' }}
        style={styles.image}
      />
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.price}>₹{item.price}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {sellerInfo && (
        <View style={styles.infoBox}>
          <Text style={styles.heading}>🛍 {sellerInfo.shopName}</Text>
          <Text style={styles.subtext}>👤 {sellerInfo.fullName}</Text>
          <Text style={styles.subtext}>📞 {sellerInfo.phone}</Text>
        </View>
      )}

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>My Products</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('Main', { screen: 'Upload' })}

        >
          <Text style={styles.addText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={{ paddingBottom: 100 }}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#DBDBD0',
  },
  infoBox: {
    backgroundColor: '#f2f2f2',
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtext: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: 'brown',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  addText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fafafa',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    width: '48%',
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 100,
    borderRadius: 10,
    marginBottom: 6,
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 12,
    color: 'gray',
  },
});
