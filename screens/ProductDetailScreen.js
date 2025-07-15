import React, { useContext } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { db } from './firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { AuthContext } from '../contexts/AuthContext';

const ProductDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);

  const product = route.params?.product;

  if (!product) {
    return (
      <View style={styles.centered}>
        <Text style={{ fontSize: 18 }}>⚠️ Product not found.</Text>
      </View>
    );
  }

  const handleAddToCart = () => {
    Alert.alert('Cart', `${product.name || 'Item'} added to cart`);
  };

  const handleBuyNow = () => {
  Alert.alert(
    'Buy Now',
    `Do you want to buy "${product.name}" for ₹${product.price}?`,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Proceed',
        onPress: () => {
          // ✅ Navigate safely with timeout
          setTimeout(() => {
            navigation.navigate('Checkout', { items: [product] });
          }, 0);
        },
      },
    ]
  );
};

  const handleAddToWishlist = async () => {
    if (!user?.uid) {
      Alert.alert('Login required', 'Please log in to add to wishlist.');
      return;
    }

    try {
      const q = query(
        collection(db, 'wishlist'),
        where('userId', '==', user.uid),
        where('productId', '==', product.id)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        Alert.alert('Already in Wishlist');
        return;
      }

      await addDoc(collection(db, 'wishlist'), {
        userId: user.uid,
        name: product.name,
        price: product.price,
        image: product.image,
        productId: product.id,
      });

      Alert.alert('🖤Added to Wishlist');
    } catch (err) {
      console.error('❌ Wishlist error:', err);
      Alert.alert('Error', 'Could not add to wishlist');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: product.image || 'https://via.placeholder.com/300' }}
        style={styles.image}
      />
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.price}>₹{product.price}</Text>
      <Text style={styles.description}>
        {product.description || 'No description available.'}
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleAddToCart} style={styles.addToCartButton}>
          <Text style={styles.buttonText}>Add to Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleBuyNow} style={styles.buyNowButton}>
          <Text style={styles.buttonText}>Buy Now</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={handleAddToWishlist} style={styles.wishlistButton}>
        <Text style={styles.wishlistText}>🤍Add to Wishlist</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ProductDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DBDBD0',
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    borderRadius: 10,
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    color: 'gray',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  addToCartButton: {
    backgroundColor: '#464642ff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  buyNowButton: {
    backgroundColor: '#464642ff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  wishlistButton: {
    marginTop: 12,
    backgroundColor: '#464642ff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#aaa',
  },
  wishlistText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});
