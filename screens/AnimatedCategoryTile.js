// ✅ AnimatedCategoryTile.js
import React, { useRef } from 'react';
import { Animated, TouchableWithoutFeedback, Image, Text, StyleSheet } from 'react-native';

const AnimatedCategoryTile = ({ item, navigation }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start(() => {
      navigation.navigate('CategoryProducts', {
        gender: item.gender,
        category: item.category,
      });
    });
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.tile, { transform: [{ scale: scaleAnim }] }]}>
        <Image source={item.image} style={styles.image} />
        <Text style={styles.label}>{item.name}</Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    marginHorizontal: 6,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default AnimatedCategoryTile;
