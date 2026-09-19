import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import LoginScreen from './src/screens/LoginScreen';
import TaskDashboardScreen from './src/screens/TaskDashboardScreen';

// Simple empty store for now
const store = configureStore({
  reducer: (state = {}) => state,
});

const App = () => {
  const [currentScreen, setCurrentScreen] = useState<'Loading' | 'Login' | 'Dashboard'>('Loading');

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          setCurrentScreen('Dashboard');
        } else {
          setCurrentScreen('Login');
        }
      } catch (error) {
        setCurrentScreen('Login');
      }
    };
    checkLogin();
  }, []);

  const navigateTo = (screen: 'Login' | 'Dashboard') => {
    setCurrentScreen(screen);
  };

  if (currentScreen === 'Loading') {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <Provider store={store}>
      {currentScreen === 'Login' ? (
        <LoginScreen onNavigate={navigateTo} />
      ) : (
        <TaskDashboardScreen onNavigate={navigateTo} />
      )}
    </Provider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default App;
