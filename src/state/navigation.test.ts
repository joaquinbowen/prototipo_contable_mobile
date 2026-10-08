import { describe, expect, it } from 'vitest';
import { getLandingTab, getRouteForSession, getTabsForRole } from './navigation';

describe('role navigation', () => {
  it('keeps the login and authenticated tab roots on distinct routes', () => {
    expect(getRouteForSession(false)).toBe('/login');
    expect(getRouteForSession(true)).toBe('/(tabs)');
  });

  it('starts contributors on home and keeps document work in their tabs', () => {
    expect(getLandingTab('CONTRIBUYENTE')).toBe('home');
    expect(getTabsForRole('CONTRIBUYENTE').map((tab) => tab.key)).toEqual([
      'home',
      'documents',
      'workspace',
      'profile',
    ]);
  });

  it('gives accountants their own opportunity and client areas', () => {
    expect(getLandingTab('CONTADOR_PROFESIONAL')).toBe('home');
    expect(getTabsForRole('CONTADOR_PROFESIONAL').map((tab) => tab.key)).toEqual([
      'home',
      'opportunities',
      'clients',
      'profile',
    ]);
  });

  it('keeps administration tools out of client-facing role navigation', () => {
    expect(getTabsForRole('SUPER_ADMIN').map((tab) => tab.key)).toEqual([
      'home',
      'users',
      'services',
      'profile',
    ]);
  });
});
