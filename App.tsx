import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import MainTab from './src/components/MainTab';
import { store } from './src/store';
import { Provider } from 'react-redux';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <MainTab />
      </NavigationContainer>
    </Provider>
  );
};

export default App;