import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../dto/navigation';
import { colors } from '../theme/colors';

import Login from '../pages/auth/Login';
import Home from '../pages/Home';
import Register from '../pages/auth/Register';

const Stack = createNativeStackNavigator<RootStackParamList>();

const MainTab: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.text.inverse,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Stack.Screen
        name="Login"
        component={Login}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Register" 
        component={Register}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Home"
        component={Home}
        options={{ headerShown: true }}
      />
    </Stack.Navigator>
  );
};

export default MainTab;