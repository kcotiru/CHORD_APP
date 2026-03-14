import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAuthStore } from '../store/authStore';
import { Colors, Typography, FontSize } from '../theme';

// Screens
import LoginScreen      from '../screens/Auth/LoginScreen';
import HomeScreen       from '../screens/HomeScreen';
import LibraryScreen    from '../screens/LibraryScreen';
import SongDetailScreen from '../screens/SongDetailScreen';
import SettingsScreen   from '../screens/SettingsScreen';
import SongFormModal    from '../components/SongFormModal';

import type {
  RootStackParamList,
  TabParamList,
  HomeStackParamList,
  LibraryStackParamList,
} from './types';

// ── Stack navigators ─────────────────────────────────────────────────────────

const RootStack    = createNativeStackNavigator<RootStackParamList>();
const Tab          = createBottomTabNavigator<TabParamList>();
const HomeStack    = createNativeStackNavigator<HomeStackParamList>();
const LibraryStack = createNativeStackNavigator<LibraryStackParamList>();

// Shared screen options for stacks inside tabs
const STACK_SCREEN_OPTIONS = {
  headerShown: false,
  contentStyle: { backgroundColor: Colors.background },
} as const;

// ── Home stack ────────────────────────────────────────────────────────────────

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={STACK_SCREEN_OPTIONS}>
      <HomeStack.Screen name="HomeMain"   component={HomeScreen} />
      <HomeStack.Screen name="SongDetail" component={SongDetailScreen} />
      <HomeStack.Screen name="SongForm"   component={() => null} />
    </HomeStack.Navigator>
  );
}

// ── Library stack ─────────────────────────────────────────────────────────────

function LibraryStackNavigator() {
  return (
    <LibraryStack.Navigator screenOptions={STACK_SCREEN_OPTIONS}>
      <LibraryStack.Screen name="LibraryMain" component={LibraryScreen} />
      <LibraryStack.Screen name="SongDetail"  component={SongDetailScreen} />
      <LibraryStack.Screen name="SongForm"    component={() => null} />
    </LibraryStack.Navigator>
  );
}

// ── Tab navigator ─────────────────────────────────────────────────────────────

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.tabBar,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          paddingBottom: 6,
          paddingTop: 6,
          height: 60,
        },
        tabBarActiveTintColor:   Colors.tabActive,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarLabelStyle: {
          fontFamily: Typography.uiMediumFamily,
          fontSize: FontSize.xs,
          marginTop: 2,
        },
        tabBarIcon: ({ color, size, focused }) => {
          const iconMap: Record<string, [string, string]> = {
            Home:     ['bookmark',         'bookmark-outline'],
            Library:  ['library',          'library-outline'],
            Settings: ['settings',         'settings-outline'],
          };
          const [active, inactive] = iconMap[route.name] ?? ['ellipse', 'ellipse-outline'];
          return (
            <Ionicons
              name={(focused ? active : inactive) as keyof typeof Ionicons.glyphMap}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home"     component={HomeStackNavigator}    options={{ title: 'Lineup' }} />
      <Tab.Screen name="Library"  component={LibraryStackNavigator} options={{ title: 'Library' }} />
      <Tab.Screen name="Settings" component={SettingsScreen}        options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
}

// ── Root navigator ────────────────────────────────────────────────────────────

export default function RootNavigator() {
  const { isAuthenticated, isGuest } = useAuthStore();
  const isInApp = isAuthenticated || isGuest;

  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary:    Colors.chord,
          background: Colors.background,
          card:       Colors.surface,
          text:       Colors.textPrimary,
          border:     Colors.border,
          notification: Colors.chord,
        },
        fonts: {
          regular: { fontFamily: Typography.uiFamily,       fontWeight: '400' },
          medium:  { fontFamily: Typography.uiMediumFamily, fontWeight: '500' },
          bold:    { fontFamily: Typography.uiBoldFamily,   fontWeight: '700' },
          heavy:   { fontFamily: Typography.uiBoldFamily,   fontWeight: '900' },
        },
      }}
    >
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isInApp ? (
          <RootStack.Screen name="App" component={TabNavigator} />
        ) : (
          <RootStack.Screen name="Auth" component={LoginScreen} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
