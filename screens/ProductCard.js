// components/ProductCard.js
import React, { useRef } from 'react';
import { Animated, Text, TouchableWithoutFeedback, Image, StyleSheet, View } from 'react-native';

const ProductCard = ({ item, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start(() => onPress(item));
  };

  return (
    <TouchableWithoutFeedback onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        <Image source={{ uri: item.image }} style={styles.image} />
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>₹{item.price}</Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#DBDBD0',
    borderRadius: 8,
    margin: 8,
    padding: 10,
    alignItems: 'center',
    elevation: 3,
  },
  image: {
    width: 120,
    height: 140,
    borderRadius: 8,
  },
  name: {
    marginTop: 8,
    fontWeight: 'bold',
  },
  price: {
    color: 'gray',
  },
});

export default ProductCard;
