import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { AppProvider } from '../state/AppState';
import { theme } from '../theme';

export default function RootLayout() {
  return <AppProvider><StatusBar style="dark" /><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.canvas }, animation: 'fade' }}><Stack.Screen name="index" /><Stack.Screen name="(tabs)" /></Stack></AppProvider>;
}
