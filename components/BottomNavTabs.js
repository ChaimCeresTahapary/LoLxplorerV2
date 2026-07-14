import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Text} from 'react-native';
import HomePage from '../screens/HomePage';
import MapPage from '../screens/MapPage';
import ProfilePage from '../screens/ProfilePage';
import {useTheme} from './ThemeContext';

const Tab = createBottomTabNavigator();

// Simple text-based icons so no extra icon library is required for the starter.
// Swap these for @expo/vector-icons later if you want nicer icons.
function TabIcon({symbol, focused, color}) {
    return (
        <Text style={{fontSize: 20, opacity: focused ? 1 : 0.5, color}}>
            {symbol}
        </Text>
    );
}

export default function BottomNavTabs() {
    const {colors} = useTheme();

    return (
        <Tab.Navigator
            screenOptions={{
                headerStyle: {backgroundColor: colors.card},
                headerTintColor: colors.text,
                tabBarStyle: {backgroundColor: colors.card},
                tabBarActiveTintColor: colors.accent,
                tabBarInactiveTintColor: colors.subtext,
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomePage}
                options={{
                    title: 'Jungle Camps',
                    tabBarIcon: ({focused, color}) => (
                        <TabIcon symbol="🌿" focused={focused} color={color}/>
                    ),
                }}
            />
            <Tab.Screen
                name="Map"
                component={MapPage}
                options={{
                    title: 'Map',
                    tabBarIcon: ({focused, color}) => (
                        <TabIcon symbol="🗺️" focused={focused} color={color}/>
                    ),
                }}
            />
            <Tab.Screen
                name="Settings"
                component={ProfilePage}
                options={{
                    title: 'Settings',
                    tabBarIcon: ({focused, color}) => (
                        <TabIcon symbol="⚙️" focused={focused} color={color}/>
                    ),
                }}
            />
        </Tab.Navigator>
    );
}