import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider } from 'react-redux';
import { store } from './store';

import HomeScreen from './screens/HomeScreen';
import ScannerScreen from './screens/ScannerScreen';
import DashboardScreen from './screens/DashboardScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen 
            name="Home" 
            component={HomeScreen}
            options={{
              title: 'SSL Validator',
              headerLargeTitle: true
            }}
          />
          <Stack.Screen 
            name="Scanner" 
            component={ScannerScreen}
            options={{
              presentation: 'modal'
            }}
          />
          <Stack.Screen 
            name="Dashboard" 
            component={DashboardScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}