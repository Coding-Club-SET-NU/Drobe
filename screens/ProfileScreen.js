import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { auth } from './firebaseConfig';
import { signOut } from 'firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message'; // ✅ Imported toast

const menuItems = [
  { title: 'Edit Profile', screen: 'EditProfile' },
  { title: 'Your Orders' },
  { title: 'Seller Dashboard' },
  { title: 'Seller Registration', screen: 'SellerRegistration' },
  { title: 'Returns & Refunds Policy' },
  { title: 'Help & Support', screen: 'SupportScreen' },
];

export default function ProfileScreen() {
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      Toast.show({
        type: 'success',
        text1: 'Signed Out',
        text2: 'You have been logged out successfully.',
      });
    } catch (error) {
      console.error('❌ Logout Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Logout Failed',
        text2: error.message,
      });
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => {
        if (item.screen) {
          try {
            navigation.navigate(item.screen);
          } catch (err) {
            console.warn(`Navigation error to ${item.screen}:`, err);
          }
        }
      }}
    >
      <Text style={styles.menuText}>{item.title}</Text>
      <Ionicons name="chevron-forward" size={20} color="#000" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>My Account</Text>

      <View style={styles.profileSection}>
        <View style={styles.avatarCircle}>
          <Ionicons name="person-outline" size={40} color="#fff" />
        </View>
        <TouchableOpacity style={styles.signInButton}>
          <Text style={styles.signInText}>
            {user ? `Hello ${user.displayName || 'User'}` : 'Sign in / Join'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={menuItems}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.menuList}
      />

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DBDBD0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  avatarCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInButton: {
    marginLeft: 20,
    backgroundColor: '#000',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  signInText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  menuList: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  menuItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'grey',
    paddingVertical: 14,
    borderRadius: 8,
    marginHorizontal: 20,
    marginTop: 24,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
