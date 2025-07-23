import React, { useRef } from 'react';
import {
  Text,
  Image,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
  GestureResponderEvent,
} from 'react-native';

export default function ProductCard({ item, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;
  const startTime = useRef(0);
  const startY = useRef(0);

  const handlePressIn = (event) => {
    startTime.current = Date.now();
    startY.current = event.nativeEvent.pageY;

    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

    const handlePressOut = (event) => {
    const duration = Date.now() - startTime.current;
    const endY = event.nativeEvent.pageY;
    const moved = Math.abs(endY - startY.current);

    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();

    // Allow only true taps (short + not moved)
    if (duration < 200 && moved < 6) {
      onPress(item);

    }
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        {item?.image ? (
          <Image source={{ uri: item.image }} style={styles.image} />
        ) : (
          <Image source={require('../assets/icon.png')} style={styles.image} />
        )}
        <Text style={styles.name}>{item?.name || 'No Name'}</Text>
        <Text style={styles.price}>
          {item?.price ? `₹${item.price}` : 'No Price'}
        </Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}


const styles = StyleSheet.create({
  card: {
  width: 160,
  borderRadius: 16,
  backgroundColor: '#fff',
  padding: 10,
},


  image: {
    width: '100%',
    height: 110,            
    borderRadius: 8,
  },
  name: {
    marginTop: 6,            // was 8
    fontWeight: 'bold',
    fontSize: 14,
  },
  price: {
    color: 'gray',
    fontSize: 13,
  },
});

