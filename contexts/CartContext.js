// screens/CartContext.js
import React, { createContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { db, auth } from '../screens/firebase';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  deleteDoc,
  doc
} from 'firebase/firestore';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const fetchCartItems = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, 'cart'), where('userId', '==', user.uid));
    const snapshot = await getDocs(q);

    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setCartItems(items);
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  const addToCart = async (product) => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Login Required', 'Please login to add items to cart.');
      return;
    }

    const q = query(
      collection(db, 'cart'),
      where('userId', '==', user.uid),
      where('productId', '==', product.id)
    );

    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      Alert.alert('Already in Cart');
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
      });

      setCartItems((prev) => [
        ...prev,
        { id: docRef.id, ...product },
      ]);

      Alert.alert('✅ Added to Cart');
    } catch (err) {
      console.error('❌ Error adding to cart:', err);
      Alert.alert('Error', 'Could not add to cart.');
    }
  };

  const clearCart = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, 'cart'), where('userId', '==', user.uid));
    const snapshot = await getDocs(q);

    const deletePromises = snapshot.docs.map((docSnap) =>
      deleteDoc(doc(db, 'cart', docSnap.id))
    );

    await Promise.all(deletePromises);
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
