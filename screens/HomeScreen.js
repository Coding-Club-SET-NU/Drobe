import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Alert,
  RefreshControl,
} from 'react-native';
import {
  collection,
  query,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { db, auth } from './firebase';
import AnimatedCategoryTile from './AnimatedCategoryTile';
import { imageCategories, bannerImages } from './imageCategories';

const { width: screenWidth } = Dimensions.get('window');

const categories = ['Home', 'Her', 'Him', 'Ministyle', 'Sale', 'New Arrivals', 'Essentials'];

export default function HomeScreen({ navigation }) {
  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchText, setSearchText] = useState('');
  const [products, setProducts] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const bannerScrollRef = useRef(null);

  // Auto scroll banners
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentBanner + 1) % bannerImages.length;
      setCurrentBanner(nextIndex);

      bannerScrollRef.current?.scrollTo({
        x: nextIndex * screenWidth,
        animated: true,
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [currentBanner]);

  const herTiles = useMemo(() => imageCategories.filter(cat => cat.gender === 'Her'), []);
  const himTiles = useMemo(() => imageCategories.filter(cat => cat.gender === 'Him'), []);
  const miniTiles = useMemo(() => imageCategories.filter(cat => cat.gender === 'Ministyle'), []);

  useEffect(() => {
    const q = query(collection(db, 'clothes'));
    getDocs(q).then(snapshot => {
      const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(products);
    }).catch(err => console.error('🔥 Error fetching products:', err));
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'clothes'), snapshot => {
      const productList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productList);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      fetchRecommended();
    }
  }, [products]);

  const fetchRecommended = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const wishlistSnapshot = await getDocs(query(collection(db, 'wishlist')));
      const userWishlist = wishlistSnapshot.docs
        .map(doc => doc.data())
        .filter(item => item.userId === user.uid);

      const wishlistProductIds = userWishlist.map(item => item.productId);

      if (wishlistProductIds.length === 0) {
        const randomSample = products.sort(() => 0.5 - Math.random()).slice(0, 6);
        setRecommended(randomSample);
      } else {
        const filtered = products.filter(p => wishlistProductIds.includes(p.id));
        setRecommended(filtered);
      }
    } catch (err) {
      console.error('🔥 Error fetching recommended products:', err);
    }
  };

  const handlePullToRefresh = async () => {
    setRefreshing(true);
    try {
      const q = query(collection(db, 'clothes'));
      const snapshot = await getDocs(q);
      const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productsData);

      const user = auth.currentUser;
      if (user) {
        const wishlistSnapshot = await getDocs(query(collection(db, 'wishlist')));
        const userWishlist = wishlistSnapshot.docs
          .map(doc => doc.data())
          .filter(item => item.userId === user.uid);

        const wishlistProductIds = userWishlist.map(item => item.productId);

        if (wishlistProductIds.length === 0) {
          const randomSample = productsData.sort(() => 0.5 - Math.random()).slice(0, 6);
          setRecommended(randomSample);
        } else {
          const filtered = productsData.filter(p => wishlistProductIds.includes(p.id));
          setRecommended(filtered);
        }
      }
    } catch (err) {
      console.error('🔁 Refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCategoryPress = (item) => {
    if (item === 'Home') {
      setSelectedGender('All');
      setSelectedCategory('All');
    } else if (['Her', 'Him', 'Ministyle'].includes(item)) {
      navigation.navigate('CategoryProducts', { gender: item });
    } else {
      navigation.navigate('CategoryProducts', { category: item });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
  <View style={styles.searchBar}>
    <Ionicons name="search" size={16} color="#666" style={{ marginRight: 6 }} />
    <TextInput
      placeholder="Search your style"
      placeholderTextColor="#666"
      value={searchText}
      onChangeText={setSearchText}
      style={styles.searchInput}
    />
    <TouchableOpacity onPress={() => navigation.navigate('ImageSearch')}>
      <Ionicons name="camera-outline" size={18} color="#666" />
    </TouchableOpacity>
  </View>

  <View style={styles.icons}>
    <TouchableOpacity onPress={() => navigation.navigate('Wishlist')}>
      <Ionicons name="heart-outline" size={24} color="#000" />
    </TouchableOpacity>
    <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
      <Ionicons name="cart-outline" size={24} color="#000" />
    </TouchableOpacity>
  </View>
</View>

      <View style={{ marginTop: 2 }}>
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                (selectedCategory === item || selectedGender === item) && styles.selectedCategory,
              ]}
              onPress={() => handleCategoryPress(item)}
            >
              <Text
                style={[
                  styles.categoryText,
                  (selectedCategory === item || selectedGender === item) && styles.selectedCategoryText,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handlePullToRefresh} />
        }
      >
        <View style={styles.carouselContainer}>
          <ScrollView
            ref={bannerScrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const scrollX = e.nativeEvent.contentOffset.x;
              const index = Math.round(scrollX / screenWidth);
              setCurrentBanner(index);
            }}
            scrollEventThrottle={16}
          >
            {bannerImages.map((img, index) => (
              <Image
                key={index}
                source={img}
                style={styles.bannerImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
          <View style={styles.dotContainer}>
            {bannerImages.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  currentBanner === index && styles.activeDot,
                ]}
              />
            ))}
          </View>
        </View>

        {recommended.length > 0 && (
        <Section
          title="Recommended For You"
          data={recommended}
          navigation={navigation} 
          isProduct        
        />
      )}


        {herTiles?.length > 0 && (
          <Section title="For Her" data={herTiles} navigation={navigation} />
        )}
        {himTiles?.length > 0 && (
          <Section title="For Him" data={himTiles} navigation={navigation} />
        )}
        {miniTiles?.length > 0 && (
          <Section title="Ministyle" data={miniTiles} navigation={navigation} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ProductCard({ item, navigation }) {
  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
      style={{
        width: 140,
        marginRight: 12,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 10,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 3,
      }}
    >
      <Image
        source={{ uri: item.image || 'https://via.placeholder.com/150' }}
        style={{
          width: '100%',
          height: 110,
          borderRadius: 8,
          backgroundColor: '#f0f0f0',
        }}
        resizeMode="cover"
      />
      <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: 'bold', marginTop: 8 }}>
        {item.name}
      </Text>
      <Text style={{ fontSize: 13, color: '#666' }}>₹{item.price}</Text>
    </TouchableOpacity>
  );
}


// ✅ Modified Section component to switch between product and category tiles
function Section({ title, data, navigation, isProduct = false }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <FlatList
        data={data}
        horizontal
        keyExtractor={(item) => item.id || item.name}
        renderItem={({ item }) =>
          isProduct ? (
            <ProductCard item={item} navigation={navigation} />
          ) : (
            <AnimatedCategoryTile item={item} navigation={navigation} />
          )
        }
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 8, paddingRight: 8 }}
      />
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    paddingTop: 17,
    paddingBottom: 18,
    paddingHorizontal: 16,
    flex: 1,
    backgroundColor: '#DBDBD0',
  },

  // ✅ Top search + icons row
  headerRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 12,
  paddingTop: 18,       // 👈 slight padding for balance
},

  searchBar: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#f0f0f0',
  borderRadius: 20,
  paddingHorizontal: 12,
  height: 35,          // 👈 taller height helps center everything
  marginRight: 12,
},

  searchInput: {
  flex: 1,
  fontSize: 14,
  paddingVertical: 2,  // 👈 reduces extra height inside input
  color: '#000',
},
sectionWrapper: {
  marginTop: 24,       // spacing from above section (like banner)
  marginBottom: 12,    // spacing before next section
},

  icons: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 18,             // 👈 spacing between icons
},

  // ✅ Category chips
  categoryList: {
  paddingTop: 0,     // 👈 was 12
  paddingBottom: 3,
  paddingHorizontal: 8,
},
flatListContent: {
  paddingLeft: 8,
  paddingRight: 8,
},
  categoryButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#eee',
    marginHorizontal: 6,
  },

  selectedCategory: {
    backgroundColor: '#708a87ff',
  },

  categoryText: {
    fontSize: 14,
    color: '#333',
  },

  selectedCategoryText: {
    fontWeight: 'bold',
    color: '#000',
  },

  // ✅ Banner carousel
  carouselContainer: {
  marginTop: 8,
  marginBottom: 4,
},

  bannerImage: {
    width: screenWidth - 32,
    height: screenWidth * 0.45,
    borderRadius: 12,
    marginRight: 8,
  },

  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 6,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },

  activeDot: {
    backgroundColor: '#333',
    width: 6,
    height: 6,
  },

  sectionContainer: {
  marginTop: 16,
},

sectionTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 8,  // 👈 creates space between title and tiles
  marginLeft: 4,
},

  imageCategoryList: {
    paddingLeft: 4,
    paddingBottom: 8,
  },

});
