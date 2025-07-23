import React from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

const screenWidth = Dimensions.get('window').width;
const itemWidth = (screenWidth - 40) / 2;

export default function Section({ title, data, isProduct = false }) {
  const navigation = useNavigation();

  const renderItem = ({ item }) => {
    if (isProduct) {
      return (
        <TouchableOpacity
          style={styles.productBox}
          onPress={() => {
            Toast.show({
              type: 'info',
              text1: `Opening "${item.name}"`,
            });
            navigation.navigate('ProductDetail', { product: item });
          }}
        >
          <Image
            source={{ uri: item.images?.[0] || 'https://via.placeholder.com/150' }}
            style={styles.image}
          />
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.price}>₹{item.price}</Text>
        </TouchableOpacity>
      );
    }

    return null;
  };

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.flatList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginBottom: 10,
  },
  flatList: {
    paddingLeft: 16,
  },
  productBox: {
    width: itemWidth,
    marginRight: 12,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#eee',
  },
  name: {
    fontSize: 14,
    paddingTop: 6,
    fontWeight: '600',
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f05',
  },
});
