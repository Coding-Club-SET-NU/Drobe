import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebaseConfig';
import { Ionicons } from '@expo/vector-icons'; 
import Toast from 'react-native-toast-message';

console.log('✅ loaded App.js, auth =', typeof auth);

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

 const handleLogin = async () => {
  if (!email || !password) {
    Toast.show({
      type: 'error',
      text1: 'Missing Fields',
      text2: 'Please enter both email and password.',
    });
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);

    Toast.show({
      type: 'success',
      text1: 'Login Successful',
    });

    navigation.replace('Main'); // 👈 change to your actual main screen
  } catch (error) {
    Toast.show({
      type: 'error',
      text1: 'Login Failed',
      text2: error.message,
    });
  }
};


  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 }}>
        Welcome Back
      </Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="grey"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{ borderBottomWidth: 1, marginBottom: 20, fontSize: 16 }}
      />

      <View
        style={{
          flexDirection: 'row',
          borderBottomWidth: 1,
          marginBottom: 30,
          alignItems: 'center'
        }}
      >
        <TextInput
          placeholder="Password"
          placeholderTextColor="grey"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          style={{ flex: 1, fontSize: 16 }}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons
            name={showPassword ? 'eye-off' : 'eye'}
            size={20}
            color="gray"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={handleLogin}
        style={{ backgroundColor: 'black', padding: 15, borderRadius: 10 }}
      >
        <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')} style={{ marginTop: 20 }}>
        <Text style={{ textAlign: 'center', color: 'blue' }}>
          Don't have an account? Register
        </Text>
      </TouchableOpacity>

      <Toast />
    </View>
  );
};

export default LoginScreen;
