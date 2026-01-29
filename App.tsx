import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider, useDispatch, useSelector } from 'react-redux';
import MainTab from './src/components/MainTab';
import { store, RootState } from './src/store';
import { loadAuthState, setUser } from './src/store/slices/authSlice';
import { authApi } from './src/services/api';

const AppContent: React.FC = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Load persisted auth state on app start
    dispatch(loadAuthState() as any);
  }, [dispatch]);

  useEffect(() => {
    // If user is authenticated but missing ID, fetch it from API
    const fetchUserId = async () => {
      if (isAuthenticated && user && !user.id && user.token) {
        try {
          console.log('User missing ID, fetching from API...');
          const userDetails = await authApi.getCurrentUser();
          console.log('Fetched user details:', userDetails);
          const updatedUser = {
            ...user,
            id: userDetails.id || userDetails.user_id || user.email,
          };
          dispatch(setUser(updatedUser));
        } catch (error) {
          console.log('Could not fetch user ID:', error);
        }
      }
    };

    fetchUserId();
  }, [isAuthenticated, user, dispatch]);

  return (
    <NavigationContainer>
      <MainTab />
    </NavigationContainer>
  );
};

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <AppContent />
      </Provider>
    </SafeAreaProvider>
  );
};

export default App;