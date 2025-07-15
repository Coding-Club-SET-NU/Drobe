import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { db, auth } from './firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';

const CartScreen = () => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert('Login Required', 'Please login to view your cart.');
      return;
    }

    const q = query(collection(db, 'cart'), where('userId', '==', currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCartItems(items);
    });

    return () => unsubscribe();
  }, []);

  const updateQuantity = async (itemId, newQty) => {
    if (newQty < 1 || newQty > 5) return;
    try {
      await updateDoc(doc(db, 'cart', itemId), {
        quantity: newQty,
      });
    } catch (err) {
      console.error('Error updating quantity:', err);
      Alert.alert('Error', 'Could not update quantity.');
    }
  };

  const removeFromCart = async (id) => {
    try {
      await deleteDoc(doc(db, 'cart', id));
      Alert.alert('Removed', 'Item removed from cart.');
    } catch (error) {
      console.error('Error removing item:', error);
      Alert.alert('Error', 'Could not remove item.');
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
    Alert.alert('✅ Order Placed', 'Thanks for shopping with us!');
  };

  const renderItem = ({ item }) => {
    const qty = item.quantity || 1;

    return (
      <View style={styles.itemCard}>
        <Image
          source={{ uri: item.image || 'https://via.placeholder.com/100' }}
          style={styles.itemImage}
        />
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
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

          <TouchableOpacity onPress={() => removeFromCart(item.id)}>
            <Text style={styles.removeBtn}>Remove</Text>
            <Text style={styles.removeBtn}>Move to wishlist</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🛒 My Cart</Text>

      {cartItems.length === 0 ? (
        <Text style={styles.emptyText}>Your cart is empty.</Text>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
          <View style={styles.totalBox}>
            <Text style={styles.totalText}>
              Total ({getItemCount()} item{getItemCount() > 1 ? 's' : ''}): ₹{getTotal()}
            </Text>
            <TouchableOpacity style={styles.buyButton} onPress={handleBuy}>
              <Text style={styles.buyButtonText}>Proceed to Buy</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

export default CartScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#DBDBD0',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyText: {
    marginTop: 40,
    fontSize: 16,
    textAlign: 'center',
    color: 'gray',
  },

  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#fcfff1ff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: '#e0e0e0',
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
  },
  removeBtn: {
    marginTop: 6,
    color: 'red',
    fontSize: 13,
  },

  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 6,
    gap: 12,
  },
  qtyButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  qtyCount: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  totalBox: {
    marginTop: 10,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  buyButton: {
    marginTop: 12,
    backgroundColor: '#848886ff',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
