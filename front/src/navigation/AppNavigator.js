import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  HomeScreen,
  EmpathyScreen,
  PerspectiveScreen,
  TransformScreen,
  HistoryScreen,
  PatternsScreen,
  SettingsScreen,
} from '../screens';
import { COLORS } from '../constants/theme';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: COLORS.backgroundLight,
          },
          animation: 'slide_from_right',
        }}
      >
        {/* Main Tabs */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />

        {/* Chat Screens */}
        <Stack.Screen
          name="Empathy"
          component={EmpathyScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="Perspective"
          component={PerspectiveScreen}
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />

        {/* Transform Screen */}
        <Stack.Screen name="Transform" component={TransformScreen} />

        {/* Patterns Screen */}
        <Stack.Screen name="Patterns" component={PatternsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
