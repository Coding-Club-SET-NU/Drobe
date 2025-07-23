// screens/CartContext.js
import React, { createContext, useState, useEffect } from 'react';
import Toast from 'react-native-toast-message';
import { db, auth } from '../screens/firebaseConfig';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc
} from 'firebase/firestore';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const fetchCartItems = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const q = query(collection(db, 'cart'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);

      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setCartItems(items);
    } catch (error) {
      console.error('❌ Error fetching cart items:', error);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  const addToCart = async (product) => {
    const user = auth.currentUser;
    if (!user) {
      Toast.show({
        type: 'info',
        text1: 'Login Required',
        text2: 'Please login to add items to cart.',
      });
      return;
    }

    const q = query(
      collection(db, 'cart'),
      where('userId', '==', user.uid),
      where('productId', '==', product.id)
    );

    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      Toast.show({
        type: 'info',
        text1: 'Already in Cart',
      });
      return;
    }

    try {
      const docRef = await addDoc(collection(db, 'cart'), {
        userId: user.uid,
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image || '',
        createdAt: new Date(),
        quantity: 1, // Default quantity if needed
      });

      setCartItems((prev) => [
        ...prev,
        { id: docRef.id, ...product, quantity: 1 },
      ]);

      Toast.show({
        type: 'success',
        text1: 'Added to Cart',
      });
    } catch (err) {
      console.error('❌ Error adding to cart:', err);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not add to cart.',
      });
    }
  };

  const clearCart = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const q = query(collection(db, 'cart'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);

      const deletePromises = snapshot.docs.map((docSnap) =>
        deleteDoc(doc(db, 'cart', docSnap.id))
      );

      await Promise.all(deletePromises);
      setCartItems([]);
    } catch (error) {
      console.error('❌ Error clearing cart:', error);
    }
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
