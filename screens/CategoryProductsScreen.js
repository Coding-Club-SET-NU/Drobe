import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { auth, db } from './firebase';
import ProductCard from './ProductCard';

const CategoryProductsScreen = ({ route, navigation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const gender = route?.params?.gender || null;
  const category = route?.params?.category || null;

  useEffect(() => {
    fetchFilteredProducts();
  }, []);

  const fetchFilteredProducts = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'clothes'));
      const allProducts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      const filtered = allProducts.filter(item => {
        const genderMatch = gender
          ? item.gender?.toLowerCase() === gender.toLowerCase()
          : true;

        const categoryMatch = category
          ? item.category?.toLowerCase() === category.toLowerCase()
          : true;

        return genderMatch && categoryMatch;
      });

      setProducts(filtered);
    } catch (error) {
      console.error('🔥 Error fetching products:', error);
      Alert.alert('Error', 'Could not load products.');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <ProductCard
      item={item}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
    />
  );

  const headerText =
    gender && category
      ? `${gender} / ${category}`
      : gender
      ? gender
      : category
      ? category
      : 'Products';

  
  return (
  <View style={styles.container}>
    <View style={styles.backWrapper}>
      <Text style={styles.backButton} onPress={() => navigation.goBack()}>
        ← Back
      </Text>
    </View>

    <Text style={styles.header}>{headerText}</Text>
    {loading ? (
      <ActivityIndicator size="large" color="brown" />
    ) : products.length === 0 ? (
      <Text style={styles.emptyText}>No products found.</Text>
    ) : (
      <FlatList
        data={products}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={{ paddingBottom: 80 }}
      />
    )}
  </View>
);
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#DBDBD0',
    flex: 1,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textTransform: 'capitalize',
  },
  backButton: {
  color: 'black',
  marginBottom: 6,
  fontSize: 16,
},
backWrapper: {
  marginTop: 19,
  marginBottom: 4,
},

backButton: {
  color: 'black',
  fontSize: 16,
  fontWeight: '500',
},

  emptyText: {
    textAlign: 'center',
    color: 'gray',
    marginTop: 20,
  },
});

export default CategoryProductsScreen;
