import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  addDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WishlistScreen({ navigation }) {
  const [wishlistItems, setWishlistItems] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user?.uid) {
      fetchWishlist();
    }
  }, [user]);

  const fetchWishlist = async () => {
    try {
      const q = query(collection(db, 'wishlist'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setWishlistItems(items);
    } catch (err) {
      console.error('❌ Wishlist fetch error:', err);
    }
  };

  const removeFromWishlist = async (itemId) => {
    try {
      await deleteDoc(doc(db, 'wishlist', itemId));
      setWishlistItems(prev => prev.filter(item => item.id !== itemId));
    } catch (err) {
      console.error('❌ Delete error:', err);
    }
  };

  const moveToCart = async (item) => {
    try {
      await addDoc(collection(db, 'cart'), {
        userId: user.uid,
        name: item.name,
        price: item.price,
        image: item.image,
        productId: item.productId || null,
      });
      await removeFromWishlist(item.id);
    } catch (err) {
      console.error('❌ Move to cart error:', err);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: item.image || 'https://via.placeholder.com/150' }}
        style={styles.image}
      />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>₹{item.price}</Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => moveToCart(item)} style={styles.actionButton}>
            <Ionicons name="cart-outline" size={18} color="#728C69" />
            <Text style={[styles.actionText,{ color: '#728C69'}]}>Move to Cart</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => removeFromWishlist(item.id)} style={styles.actionButton}>
            <Ionicons name="trash-outline" size={18} color="#728C69" />
            <Text style={[styles.actionText, { color: '#728C69' }]}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>My Wishlist</Text>
      {wishlistItems.length === 0 ? (
        <Text style={styles.emptyText}>Your wishlist is empty.</Text>
      ) : (
        <FlatList
          data={wishlistItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
    paddingHorizontal: 16,
    backgroundColor: '#DBDBD0',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  list: {
    paddingBottom: 30,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#ddd',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  price: {
    color: '#444',
    marginVertical: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 6,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 13,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    marginTop: 50,
    textAlign: 'center',
  },
});
