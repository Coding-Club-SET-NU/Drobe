// ✅ Full ProductDetailScreen.js with Size Selection + Chart + Free Size Fallback

import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { AuthContext } from '../contexts/AuthContext';
import Toast from 'react-native-toast-message';

export default function ProductDetailScreen() {
  const { user } = useContext(AuthContext);
  const route = useRoute();
  const navigation = useNavigation();

  const product = route.params?.product;
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [showChart, setShowChart] = useState(false);

  useEffect(() => {
    const checkWishlist = async () => {
      if (!user?.uid || !product?.id) return;
      const q = query(
        collection(db, 'wishlist'),
        where('userId', '==', user.uid),
        where('productId', '==', product.id)
      );
      const snapshot = await getDocs(q);
      setIsWishlisted(!snapshot.empty);
    };

    checkWishlist();
  }, [user, product]);

  const toggleWishlist = async () => {
    if (!user?.uid) {
      Toast.show({
        type: 'info',
        text1: 'Login Required',
        text2: 'Please log in to manage wishlist.',
      });
      return;
    }

    const wishlistRef = collection(db, 'wishlist');
    const q = query(
      wishlistRef,
      where('userId', '==', user.uid),
      where('productId', '==', product.id)
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const docId = snapshot.docs[0].id;
      await deleteDoc(doc(wishlistRef, docId));
      setIsWishlisted(false);
      Toast.show({
        type: 'success',
        text1: 'Removed from Wishlist',
      });
    } else {
      await addDoc(wishlistRef, {
        userId: user.uid,
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      });
      setIsWishlisted(true);
      Toast.show({
        type: 'success',
        text1: 'Added to Wishlist',
      });
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      Toast.show({ type: 'error', text1: 'Please select a size' });
      return;
    }
    Toast.show({
      type: 'success',
      text1: 'Cart',
      text2: `${product.name} (${selectedSize}) added to bag.`,
    });
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      Toast.show({ type: 'error', text1: 'Please select a size' });
      return;
    }
    Toast.show({
      type: 'info',
      text1: 'Redirecting to Checkout',
      text2: `Buying "${product.name}" - Size: ${selectedSize}`,
    });
    navigation.navigate('Checkout', { items: [product], size: selectedSize });
  };

  if (!product) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>⚠️ Product not found.</Text>
      </View>
    );
  }

  const sizes = product?.sizes?.length > 0 ? product.sizes : ['Free Size'];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />

        <TouchableOpacity onPress={toggleWishlist} style={styles.wishlistIcon}>
          <Ionicons
            name={isWishlisted ? 'heart' : 'heart-outline'}
            size={24}
            color="#f05"
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.productName}>{product.name}</Text>
      <Text style={styles.productPrice}>₹{product.price}</Text>

      <Text style={{ fontSize: 16, marginTop: 24, fontWeight: '600' }}>Select Size</Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
        {sizes.map((sz) => (
          <TouchableOpacity
            key={sz}
            onPress={() => setSelectedSize(sz)}
            style={{
              borderWidth: 1.5,
              borderColor: selectedSize === sz ? '#f05' : '#aaa',
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 30,
              backgroundColor: selectedSize === sz ? '#f05' : '#fff',
            }}
          >
            <Text style={{ color: selectedSize === sz ? '#fff' : '#333' }}>{sz}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {sizes.length > 1 && (
        <TouchableOpacity onPress={() => setShowChart(true)} style={{ marginTop: 14 }}>
          <Text style={{ color: '#f05', textDecorationLine: 'underline' }}>View Size Chart</Text>
        </TouchableOpacity>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity onPress={handleBuyNow} style={styles.buyNowButton}>
          <Ionicons name="bag-outline" size={18} color="#ff" />
          <Text style={styles.buyNowText}>Buy Now</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleAddToCart} style={styles.addToCartButton}>
          <Ionicons name="bag" size={18} color="#fff" />
          <Text style={styles.addToCartText}>Add to Bag</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showChart} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: '#000000aa', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: '90%', backgroundColor: '#fff', borderRadius: 8, padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Size Chart</Text>
            <Text>- S: Chest 36", Length 24"</Text>
            <Text>- M: Chest 38", Length 25"</Text>
            <Text>- L: Chest 40", Length 26"</Text>
            <TouchableOpacity onPress={() => setShowChart(false)} style={{ marginTop: 20, alignSelf: 'flex-end' }}>
              <Text style={{ color: '#f05' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Toast />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DBDBD0',
    padding: 16,
  },
  imageContainer: {
    position: 'relative',
    alignItems: 'center',
    marginTop: 20,
  },
  backButton: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 6,
    elevation: 4,
    zIndex: 10,
  },
  wishlistIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 6,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: 400,
    borderRadius: 10,
    backgroundColor: '#eee',
  },
  productName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 16,
  },
  productPrice: {
    fontSize: 20,
    color: '#f05',
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  buyNowButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#79c6bbff', 
    paddingVertical: 14,
    borderRadius: 30,
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyNowText: {
    color: '#ff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: '#79c6a6ff',
    paddingVertical: 14,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
