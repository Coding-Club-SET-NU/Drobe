import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { auth, db } from './firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

const OrderScreen = () => {
  const [orders, setOrders] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      Toast.show({
        type: 'info',
        text1: 'Login Required',
        text2: 'Please login to view your orders.',
      });

      navigation.navigate('LoginScreen');
      return;
    }

    const fetchOrders = async () => {
      const q = query(collection(db, 'orders'), where('userId', '==', currentUser.uid));
      const snapshot = await getDocs(q);
      const orderList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(orderList);
    };

    fetchOrders();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text>{item.name}</Text>
      <Text>₹{item.price}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🧾 My Orders</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  card: {
    padding: 12,
    backgroundColor: '#DBDBD0',
    borderRadius: 10,
    marginBottom: 10,
  },
});

export default OrderScreen;
