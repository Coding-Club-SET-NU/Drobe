import React, { useContext } from 'react';
import { View, Text, Button, FlatList, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CartContext } from '../contexts/CartContext';
import { db, auth } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const CheckoutScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { cartItems, clearCart } = useContext(CartContext);

  // ✅ Use item passed via Buy Now or fall back to full cart
  const items = route?.params?.items || cartItems;

  // ✅ Safely calculate total price
  const total = Array.isArray(items)
    ? items.reduce((sum, item) => sum + (item?.price || 0), 0)
    : 0;

  const handleCheckout = async () => {
    try {
      const userId = auth.currentUser?.uid;

      if (!userId) {
        Alert.alert("Error", "User not logged in.");
        return;
      }

      if (!items || items.length === 0) {
        Alert.alert("Your cart is empty.");
        return;
      }

      // ✅ Save order to Firebase
      await addDoc(collection(db, 'orders'), {
        userId,
        items,
        total,
        status: 'Placed',
        createdAt: serverTimestamp(),
      });

      // ✅ Clear cart only if doing full-cart checkout
      if (!route.params?.items) {
        clearCart();
      }

      // ✅ Navigate to Thank You screen
      navigation.navigate('ThankYou');

    } catch (error) {
      console.error('❌ Order Error:', error);
      Alert.alert("Failed", "Could not place order.");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24 }}>🧾 Checkout</Text>

      <FlatList
        data={items}
        keyExtractor={(item, index) =>
          item?.id ? item.id.toString() : index.toString()
        }
        renderItem={({ item }) => (
          <Text>{item.name} - ₹{item.price}</Text>
        )}
      />

      <Text style={{ fontSize: 18, marginTop: 10 }}>Total: ₹{total}</Text>
      <Button title="Buy Now" onPress={handleCheckout} />
    </View>
  );
};

export default CheckoutScreen;
