import React, { useContext } from 'react';
import { View, Text, Button, FlatList } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CartContext } from '../contexts/CartContext';
import { db, auth } from './firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import Toast from 'react-native-toast-message';

const CheckoutScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { cartItems, clearCart } = useContext(CartContext);

  const items = route?.params?.items || cartItems;

  const total = Array.isArray(items)
    ? items.reduce((sum, item) => sum + (item?.price || 0), 0)
    : 0;

  const handleCheckout = async () => {
    try {
      const userId = auth.currentUser?.uid;

      if (!userId) {
        Toast.show({
          type: 'error',
          text1: 'User not logged in',
        });
        return;
      }

      if (!items || items.length === 0) {
        Toast.show({
          type: 'info',
          text1: 'Your cart is empty',
        });
        return;
      }

      await addDoc(collection(db, 'orders'), {
        userId,
        items,
        total,
        status: 'Placed',
        createdAt: serverTimestamp(),
      });

      if (!route.params?.items) {
        clearCart();
      }

      navigation.navigate('ThankYou');
    } catch (error) {
      console.error('❌ Order Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Order failed',
        text2: 'Could not place order',
      });
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

      <Toast />
    </View>
  );
};

export default CheckoutScreen;
