import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import AppNavigator from './AppNavigator';
import { CartProvider } from './contexts/CartContext'; // correct the path if needed


export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppNavigator />
      </CartProvider>
    </AuthProvider>
  );
}
