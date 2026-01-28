import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import MainTab from './src/components/MainTab';
import { store } from './src/store';
import { loadAuthState } from './src/store/slices/authSlice';

const App: React.FC = () => {
  useEffect(() => {
    // Load persisted auth state on app start
    store.dispatch(loadAuthState());
  }, []);

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <NavigationContainer>
          <MainTab />
        </NavigationContainer>
      </Provider>
    </SafeAreaProvider>
  );
};

export default App;