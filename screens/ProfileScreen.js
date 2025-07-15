import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { CommonActions, useNavigation } from '@react-navigation/native';

const ProfileScreen = () => {
  const [user, setUser] = useState(null);
  const [sellerData, setSellerData] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(currentUser => {
      if (currentUser) {
        setUser(currentUser);
        fetchSellerDetails(currentUser.uid);
      } else {
        setUser(null);
        setSellerData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchSellerDetails = async uid => {
    try {
      const sellerRef = doc(db, 'sellers', uid);
      const sellerSnap = await getDoc(sellerRef);
      if (sellerSnap.exists()) {
        setSellerData(sellerSnap.data());
      } else {
        setSellerData(null);
      }
    } catch (error) {
      console.error('❌ Seller fetch error:', error);
      Alert.alert('Error', 'Failed to fetch seller info');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Welcome' }],
        })
      );
    } catch (error) {
      Alert.alert('Logout Failed', error.message);
    }
  };

  const avatarUri = user?.photoURL || 'https://i.ibb.co/ZYW3VTp/brown-user.png';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>My Profile</Text>

      {user ? (
        <>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
            <Text style={styles.name}>{user.displayName || 'Name'}</Text>
            <Text style={styles.email}>{user.email}</Text>
          </View>

          {/* ACCOUNT DETAILS WITHOUT CARD */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}><Text style={styles.label}>UID:</Text> {user.uid}</Text>
            <Text style={styles.infoText}>
              <Text style={styles.label}>Account Type:</Text> {sellerData ? '✅ Seller' : '🧍 Regular User'}
            </Text>

            {sellerData && (
              <>
                <Text style={styles.infoText}><Text style={styles.label}>Full Name:</Text> {sellerData.fullName || '—'}</Text>
                <Text style={styles.infoText}><Text style={styles.label}>Phone:</Text> {sellerData.phone || '—'}</Text>
                <Text style={styles.infoText}><Text style={styles.label}>Shop Name:</Text> {sellerData.shopName || '—'}</Text>
              </>
            )}
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Order')}
            >
              <Text style={styles.actionButtonText}>🧾 View My Orders</Text>
            </TouchableOpacity>

            {!sellerData ? (
              <TouchableOpacity
                style={[styles.actionButton, styles.sellerButton]}
                onPress={() => navigation.navigate('SellerRegistration')}
              >
                <Text style={[styles.actionButtonText, styles.sellerButtonText]}>
                  🛍 Become a Seller
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.actionButton, styles.shopButton]}
                onPress={() => navigation.navigate('MyShop')}
              >
                <Text style={[styles.actionButtonText, styles.shopButtonText]}>
                  🏬 Go to My Shop
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.actionButton, styles.logoutButton]}
              onPress={handleLogout}
            >
              <Text style={[styles.actionButtonText, styles.logoutButtonText]}>
                🚪 Log Out
              </Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.notLoggedInBox}>
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
          <Text style={styles.name}>Guest User</Text>
          <Text style={styles.email}>You're not logged in.</Text>

          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Welcome')}
          >
            <Text style={styles.primaryButtonText}>GO TO HOME</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    backgroundColor: '#DBDBD0',
    alignItems: 'center',
    minHeight: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
    color: '#333',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#ddd',
    marginBottom: 12,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
  },
  email: {
    fontSize: 16,
    color: '#666',
  },

  // NEW simple info container and texts:
  infoContainer: {
    width: '100%',
    marginBottom: 30,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#444',
  },
  label: {
    fontWeight: '600',
    color: '#555',
  },

  actionsContainer: {
    width: '100%',
  },
  actionButton: {
    backgroundColor: '#464642ff',
    paddingVertical: 14,
    borderRadius: 30,
    marginBottom: 16,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  sellerButton: {
    backgroundColor: '#f2a365',
  },
  sellerButtonText: {
    color: '#4a2c00',
  },
  shopButton: {
    backgroundColor: '#464642ff',
  },
  shopButtonText: {
    color: '#f0e6ff',
  },
  logoutButton: {
    backgroundColor: '#464642ff',
  },
  logoutButtonText: {
    color: '#fff',
  },
  notLoggedInBox: {
    alignItems: 'center',
    marginTop: 40,
  },
  primaryButton: {
    marginTop: 20,
    backgroundColor: '#898d76ff',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default ProfileScreen;
