import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
};

export type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Login'
>;

export type MainTabsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MainTabs'
>;
 

export type RegisterScreenRouteProp = NativeStackNavigationProp<
  RootStackParamList,
  'Register'
>;


export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  // ...other screens
};

export type RegisterScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Register'
>;