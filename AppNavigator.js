import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from './contexts/AuthContext';

// Screens
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import MainTabs from './navigation/MainTabs';
import ProductDetailScreen from './screens/ProductDetailScreen';
import WishlistScreen from './screens/WishlistScreen';
import CartScreen from './screens/CartScreen';
import OrderScreen from './screens/OrderScreen';
import CheckoutScreen from './screens/CheckoutScreen';
import ImageSearchScreen from './screens/ImageSearchScreen';
import CategoryProductsScreen from './screens/CategoryProductsScreen';
import SellerDashboardScreen from './screens/SellerDashboardScreen';
import SellerRegistrationScreen from './screens/SellerRegistrationScreen';
import MyShopScreen from './screens/MyShopScreen';
import ThankYou from './screens/ThankYou';
import Register from './screens/Register';
import EditProfileScreen from './screens/EditProfileScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import RecommendedScreen from './screens/ProductDetailScreen';
import Section from './screens/Section';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user } = useContext(AuthContext);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Only testing Welcome screen for now */}
        <Stack.Screen name="Welcome" component={WelcomeScreen} />

        {/* Commented out for debugging the text warning */}
        <Stack.Screen name="Login" component={LoginScreen} /> 
        <Stack.Screen name="SignUp" component={SignUpScreen} /> 
         <Stack.Screen name="Main" component={MainTabs} /> 
         <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
         <Stack.Screen name="Wishlist" component={WishlistScreen} /> 
         <Stack.Screen name="Cart" component={CartScreen} /> 
         <Stack.Screen name="Order" component={OrderScreen} /> 
         <Stack.Screen name="Checkout" component={CheckoutScreen} /> 
         <Stack.Screen name="ImageSearch" component={ImageSearchScreen} /> 
         <Stack.Screen name="CategoryProducts" component={CategoryProductsScreen} /> 
         <Stack.Screen name="SellerRegistration" component={SellerRegistrationScreen} /> 
         <Stack.Screen name="SellerDashboard" component={SellerDashboardScreen} /> 
         <Stack.Screen name="MyShop" component={MyShopScreen}/> 
        <Stack.Screen name="ThankYou" component={ThankYou} /> 
        <Stack.Screen name="Register" component={Register} /> 
        <Stack.Screen name="Notifications" component={NotificationsScreen} /> 
        <Stack.Screen name="EditProfile" component={EditProfileScreen} /> 
        <Stack.Screen name="Recommended" component={RecommendedScreen} />
        <Stack.Screen name="Section" component={Section} />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}
