import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import Toast from 'react-native-toast-message';

const screenWidth = Dimensions.get('window').width;
const itemWidth = (screenWidth - 32) / 2;

export default function RecommendedScreen() {
  const navigation = useNavigation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        const wishlistSnapshot = await getDocs(collection(db, 'wishlist'));

        const productCount = {};
        wishlistSnapshot.forEach((doc) => {
          const productId = doc.data().productId;
          if (productId) {
            productCount[productId] = (productCount[productId] || 0) + 1;
          }
        });

        const sortedProductIds = Object.entries(productCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([id]) => id);

        const fetchedProducts = [];
        for (const id of sortedProductIds) {
          const productDoc = await getDoc(doc(db, 'clothes', id));
          if (productDoc.exists()) {
            fetchedProducts.push({ id: productDoc.id, ...productDoc.data() });
          }
        }

        setProducts(fetchedProducts);

        if (fetchedProducts.length === 0) {
          Toast.show({
            type: 'info',
            text1: 'No recommended products yet',
          });
        }
      } catch (error) {
        console.error('Error loading recommended:', error);
        Toast.show({
          type: 'error',
          text1: 'Error loading recommendations',
          text2: error.message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecommended();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
      style={styles.productBox}
    >
      <Image
        source={{ uri: item.images?.[0] || 'https://via.placeholder.com/150' }}
        style={styles.image}
      />
      <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.price}>₹{item.price}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#DBDBD0" />
        <Text style={{ marginTop: 10 }}>Loading recommendations...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#DBDBD0' }}>
      {products.length === 0 ? (
        <View style={styles.noDataBox}>
          <Text style={styles.noDataText}>No products found in this category.</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.container}
        />
      )}
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor:'#d7d9cfff',
    paddingHorizontal: 12,
    paddingTop: 20,
    paddingBottom: 60,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  productBox: {
    width: itemWidth,
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 6,
    marginLeft: 2,
  },
  price: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
    marginLeft: 2,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  noDataBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noDataText: {
    fontSize: 16,
    color: 'gray',
  },
});
