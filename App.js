import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {StatusBar} from 'expo-status-bar';
import {ThemeProvider} from './components/ThemeContext';
import BottomNavTabs from './components/BottomNavTabs';

export default function App() {
    return (
        <ThemeProvider>
            <NavigationContainer>
                <BottomNavTabs/>
                <StatusBar style="auto"/>
            </NavigationContainer>
        </ThemeProvider>
    );
}