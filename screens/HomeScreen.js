 import React, { useEffect, useState, useMemo, useRef, useContext} from 'react';
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
  RefreshControl,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons'; 
import { db,auth } from './firebaseConfig';
import { collection, query, getDocs, onSnapshot } from 'firebase/firestore';
import { imageCategories, bannerImages } from './imageCategories';
import AnimatedCategoryTile from './AnimatedCategoryTile';
import ProductCard from './ProductCard';
import { CartContext } from '../contexts/CartContext';
import LocationDisplay from '../components/LocationDisplay';

const { width: screenWidth } = Dimensions.get('window');

const categories = ['Home', 'Her', 'Him', 'Ministyle', 'Sale', 'New Arrivals', 'Essentials'];


export default function HomeScreen({ navigation }) {

const { cartItems } = useContext(CartContext);
const cartCount = cartItems?.length || 0;
console.log('🛒 Cart Items:', cartItems); 

  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchText, setSearchText] = useState('');
  const [products, setProducts] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [locationText, setLocationText] = useState('Fetching location...');
  const bannerScrollRef = useRef(null);
  


useEffect(() => {
  (async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Toast.show({
        type: 'error',
        text1: 'Permission Denied',
        text2: 'Location access is required to show your city.',
      });
      setLocationText('Permission denied');
      return;
    }

    let loc = await Location.getCurrentPositionAsync({});
    let reverseGeocode = await Location.reverseGeocodeAsync(loc.coords);

    if (reverseGeocode?.length > 0) {
      let city = reverseGeocode[0].city || reverseGeocode[0].district || '';
      let region = reverseGeocode[0].region || '';
      setLocationText(`${city}, ${region}`);
    } else {
      setLocationText('Location not found');
    }
  })();
}, []);


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
    {/* Header section */}
    <View style={styles.headerWrapper}>
      <LocationDisplay />


      <View style={styles.headerRow}>
       <View style={styles.searchBar}>
  <Ionicons name="search" size={18} color="#666" style={{ marginRight: 8 }} />
  <TextInput
    placeholder="Search in Drobe"
    placeholderTextColor="#666"
    value={searchText}
    onChangeText={setSearchText}
    style={styles.searchInput}
    multiline={false}
    numberOfLines={1}
    returnKeyType="search"
  />

          <TouchableOpacity onPress={() => navigation.navigate('ImageSearch')}>
            <Ionicons name="camera-outline" size={18} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.icons}>
  <TouchableOpacity onPress={() => navigation.navigate('Wishlist')}>
    <Ionicons name="heart-outline" size={24} color="#000" />
  </TouchableOpacity>

  <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={{ marginLeft: 16 }}>
    <Ionicons name="cart-outline" size={24} color="#000" />
    {cartCount > 0 && (
      <View style={styles.cartBadge}>
        <Text style={styles.cartBadgeText}>{cartCount}</Text>
      </View>
    )}
  </TouchableOpacity>

  <TouchableOpacity
    onPress={() => navigation.navigate('Notifications')}
    style={{ marginLeft: 16 }}
  >
    <Ionicons name="notifications-outline" size={24} color="#000" />
  </TouchableOpacity>
</View>

      </View>
    </View>

    {/* Category Chips */}
    <View style={{ marginTop: 6 }}>
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

    {/* Scrollable Content */}
    <ScrollView
      style={{ flex: 1 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handlePullToRefresh} />
      }
    >
      {/* Banner Carousel */}
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

      {/* Product Sections */}
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
// ✅ Modified Section component to switch between product and category tiles
function Section({ title, data, navigation, isProduct = false }) {
  return (
    <View style={{ marginBottom: 24 }}>
      {/* Title WITHOUT padding */}
      <Text style={{
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
      }}>
        {title}
      </Text>

      {/* FlatList with NO extra padding */}
      <FlatList
        data={data}
        horizontal
        keyExtractor={(item, index) => item.id || item.name || index.toString()}
        renderItem={({ item, index }) => (
          <View style={{
            marginRight: 12,
            marginLeft: index === 0 ? 0 : 0,
          }}>
            {isProduct ? (
              <ProductCard
                item={item}
                onPress={() =>
                  navigation.navigate('ProductDetail', { product: item })
                }
              />
            ) : (
              <AnimatedCategoryTile item={item} navigation={navigation} />
            )}
          </View>
        )}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 59,
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
  marginBottom: 6,
  paddingTop:15,       // 👈 slight padding for balance
},
headerWrapper: {
  paddingHorizontal: 0,
  paddingTop: 10, // ⬅ decrease this
  backgroundColor: '#DBDBD0',
},

 topRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: 30, // or try 25
  marginHorizontal: 10,
},

 searchBar: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#fff',
  borderRadius: 12,
  paddingHorizontal: 12,
  paddingVertical: 6,
  width: '80%',
  maxHeight: 44,
  elevation: 2,
},

searchInput: {
  flex: 1,
  fontSize: 14,
  color: '#000',
  paddingVertical: 0,
  paddingHorizontal: 0,
  includeFontPadding: false,
  textAlignVertical: 'center',
},

sectionWrapper: {
  marginTop: 24,       // spacing from above section (like banner)
  marginBottom: 12,    // spacing before next section
},

  icons: {
  width: 32,
  height: 32,
  justifyContent: 'center',
  alignItems: 'center',
},

  // ✅ Category chips
  categoryList: {
  paddingTop: 6,     // 👈 was 12
  paddingBottom: -17,
  paddingHorizontal: -3,
  marginBottom: 0,
},
flatListContent: {
  paddingLeft: 8,
  paddingRight: 8,
},
  categoryButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#eee',
    marginHorizontal: 2,
  },

  selectedCategory: {
    backgroundColor: '#708a87ff',
  },

  categoryText: {
    fontSize: 14,
    color: '#333',
  },
  categoryItem: {
  alignItems: 'center',
  marginHorizontal: 0,
  marginVertical: 0, // increase vertical space
},


  selectedCategoryText: {
    fontWeight: 'bold',
    color: '#000',
  },

  // ✅ Banner carousel
  carouselContainer: {
  marginTop: 30,
  marginBottom: 4,
},

  bannerImage: {
  width: Dimensions.get('window').width - 32,
  height: 120, // Reduced height
  borderRadius: 12,
  resizeMode: 'cover',
  marginHorizontal: 0,
},

categoryRow: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'center',
  paddingHorizontal: 10,
  marginTop: 20,     // 👈 this pushes it down
  marginBottom: 0,   // 👈 optional: space before banners
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
    marginHorizontal: 3,
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
  fontSize: 20,
  fontWeight: 'bold',
  marginTop: 7, // increased
  marginBottom: 12,
  paddingHorizontal: 16,
},

  imageCategoryList: {
    paddingLeft: 4,
    paddingBottom: 7,
  },
  searchWrapper: {
  marginTop: 20,
  marginHorizontal: 16,
},

locationRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 30, // spacing between location and search
},
icons: {
  flexDirection: 'row',
  alignItems: 'center',
},

locationText: {
  fontSize: 16,
  color: '#333',
  marginBottom: 2,
  fontWeight: '500',
  marginTop: -30, // ⬅ push upwards
},

cartBadge: {
  position: 'absolute',
  top: -4,
  right: -8,
  backgroundColor: '#728C69',
  borderRadius: 8,
  minWidth: 16,
  height: 16,
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 3,
  zIndex: 10,
},
cartBadgeText: {
  color: '#fff',
  fontSize: 10,
  fontWeight: 'bold',
},

});