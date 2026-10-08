import React from 'react';
import { Redirect } from 'expo-router';
import { useApp } from '../state/AppState';
import { getRouteForSession } from '../state/navigation';

export default function IndexRoute() {
  const { isAuthenticated } = useApp();
  return <Redirect href={getRouteForSession(isAuthenticated)} />;
}
