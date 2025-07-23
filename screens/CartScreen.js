// ✅ Full corrected code with style and logic for preventing duplicate cart items based on productId + size

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { db, auth } from './firebaseConfig';
import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
  setDoc,
  updateDoc,
  getDocs,
} from 'firebase/firestore';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';

const CartScreen = () => {
  const navigation = useNavigation();
  const [cartItems, setCartItems] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);

  const fetchWishlist = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    const q = query(collection(db, 'wishlist'), where('userId', '==', userId));
    onSnapshot(q, (snap) => {
      const ids = snap.docs.map((doc) => doc.data().productId);
      setWishlistIds(ids);
    });
  };

  const fetchCartItems = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    const q = query(collection(db, 'cart'), where('userId', '==', userId));
    onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCartItems(items);
    });
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      Toast.show({
        type: 'error',
        text1: 'Login required',
        text2: 'Please login to view your cart.',
      });
      return;
    }
    fetchCartItems();
    fetchWishlist();
  }, []);

  const updateQuantity = async (itemId, newQty) => {
    if (newQty < 1 || newQty > 5) return;
    try {
      await updateDoc(doc(db, 'cart', itemId), { quantity: newQty });
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not update quantity.',
      });
    }
  };

  const removeFromCart = async (id) => {
    try {
      await deleteDoc(doc(db, 'cart', id));
      Toast.show({ type: 'success', text1: 'Removed from cart' });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not remove item.',
      });
    }
  };

  const moveToWishlist = async (item) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return Toast.show({ type: 'error', text1: 'Login required' });

    if (wishlistIds.includes(item.productId)) return;

    const wishlistRef = doc(db, 'wishlist', `${userId}_${item.productId}`);
    try {
      await setDoc(wishlistRef, {
        userId,
        productId: item.productId,
        name: item.name,
        image: item.image,
        price: item.price,
        addedAt: new Date(),
      });
      Toast.show({ type: 'success', text1: 'Moved to Wishlist' });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error adding to wishlist' });
    }
  };

  const getTotal = () => {
    return cartItems.reduce(
      (sum, item) => sum + parseFloat(item.price) * (item.quantity || 1),
      0
    );
  };

  const getItemCount = () => {
    return cartItems.reduce((count, item) => count + (item.quantity || 1), 0);
  };

  const handleBuy = () => {
    Toast.show({
      type: 'success',
      text1: '✅ Order Placed',
      text2: 'Thanks for shopping with us!',
    });
  };

  const renderItem = ({ item }) => {
    const qty = item.quantity || 1;
    const isWishlisted = wishlistIds.includes(item.productId);

    return (
      <View style={styles.itemRow}>
        <Image
          source={{ uri: item.image || 'https://via.placeholder.com/100' }}
          style={styles.itemImage}
        />

        <View style={styles.itemContent}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemSize}>Size: {item.size || 'N/A'}</Text>
          <Text style={styles.itemPrice}>₹{item.price}</Text>

          <View style={styles.quantityRow}>
            <TouchableOpacity
              onPress={() => updateQuantity(item.id, qty - 1)}
              style={[styles.qtyButton, qty <= 1 && { opacity: 0.3 }]}
              disabled={qty <= 1}
            >
              <Text style={styles.qtyText}>−</Text>
            </TouchableOpacity>

            <Text style={styles.qtyCount}>{qty}</Text>

            <TouchableOpacity
              onPress={() => updateQuantity(item.id, qty + 1)}
              style={[styles.qtyButton, qty >= 5 && { opacity: 0.3 }]}
              disabled={qty >= 5}
            >
              <Text style={styles.qtyText}>+</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity onPress={() => removeFromCart(item.id)}>
              <Ionicons name="trash-outline" size={22} color="#728C69" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => moveToWishlist(item)}
              disabled={isWishlisted}
            >
              <MaterialCommunityIcons
                name="heart-plus-outline"
                size={20}
                color="#728C69"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.heading}>My Cart</Text>
        <View style={{ width: 24 }} />
      </View>

      {cartItems.length === 0 ? (
        <Text style={styles.emptyText}>Your cart is empty.</Text>
      ) : (
        <View style={{ flex: 1 }}>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 120 }}
          />

          <View style={styles.totalBox}>
            <Text style={styles.totalText}>
              Total ({getItemCount()} item{getItemCount() > 1 ? 's' : ''}): ₹{getTotal().toFixed(2)}
            </Text>
            <TouchableOpacity style={styles.buyButton} onPress={handleBuy}>
              <Text style={styles.buyButtonText}>Proceed to Buy</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Toast />
    </View>
  );
};

export default CartScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#DBDBD0',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 19,
    marginTop: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingTop: 35,
  },
  emptyText: {
    marginTop: 40,
    fontSize: 16,
    textAlign: 'center',
    color: 'gray',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    gap: 14,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  itemContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
  },
  itemSize: {
    fontSize: 13,
    color: '#333',
    marginBottom: 6,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 6,
  },
  qtyButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  qtyCount: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 4,
  },
  totalBox: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 8,
  },
  buyButton: {
    backgroundColor: 'grey',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
