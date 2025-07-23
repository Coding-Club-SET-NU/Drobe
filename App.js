import React from 'react';
import AppNavigator from './AppNavigator';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppNavigator />
      </CartProvider>
    </AuthProvider>
  );
}
