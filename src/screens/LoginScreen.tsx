import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, TVFocusGuideView, findNodeHandle } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

interface LoginScreenProps {
  onNavigate: (screen: 'Login' | 'Dashboard') => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigate }) => {
  const [loginId, setLoginId] = useState('shamshad@triserv360.com');
  const [password, setPassword] = useState('12345678');
  const [isLoading, setIsLoading] = useState(false);

  const loginIdRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const loginButtonRef = useRef<TouchableOpacity>(null);

  const handleLogin = async () => {
    if (!loginId || !password) {
      Alert.alert('Error', 'Please enter both Login ID and Password');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('login', {
        login_id: loginId,
        password: password,
      });

      if (response.data && response.data.data && response.data.data.token && response.data.data.tenant_id) {
        await AsyncStorage.setItem('token', response.data.data.token);
        await AsyncStorage.setItem('tenant_id', String(response.data.data.tenant_id));
        onNavigate('Dashboard');
      } else {
        Alert.alert('Error', 'Invalid response from server');
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert('Login Failed', error?.response?.data?.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>
            Workorio <Text style={styles.titleAccent}>TV</Text>
          </Text>
          <Text style={styles.subtitle}>Welcome back. Please sign in to continue.</Text>
        </View>

        <Text style={styles.label}>Login ID</Text>
        <TextInput
          ref={loginIdRef}
          style={styles.input}
          placeholder="Enter your login ID"
          placeholderTextColor="#666666"
          value={loginId}
          onChangeText={setLoginId}
          onSubmitEditing={() => passwordRef.current?.focus()}
          autoCapitalize="none"
          focusable={true}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          ref={passwordRef}
          style={styles.input}
          placeholder="Enter your password"
          placeholderTextColor="#666666"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          onSubmitEditing={() => loginButtonRef.current?.focus()}
          focusable={true}
        />

        <TouchableOpacity
          ref={loginButtonRef}
          style={styles.button}
          onPress={handleLogin}
          disabled={isLoading}
          focusable={true}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Pitch black for OLED-like premium feel
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '45%',
    backgroundColor: '#111111', // Very dark charcoal
    paddingHorizontal: 56,
    paddingVertical: 32,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#222222',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: 12,
  },
  titleAccent: {
    color: '#0066FF',
  },
  subtitle: {
    fontSize: 16,
    color: '#888888',
    fontWeight: '400',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#999999',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#1A1A1A',
    color: '#FFFFFF',
    fontSize: 18,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16, // Smoother rounded corners
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  button: {
    backgroundColor: '#0066FF',
    paddingVertical: 16,
    borderRadius: 100, // Pill shaped
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});

export default LoginScreen;
