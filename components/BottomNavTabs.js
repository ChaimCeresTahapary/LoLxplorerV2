import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Ionicons} from '@expo/vector-icons';
import HomePage from '../screens/HomePage';
import MapPage from '../screens/MapPage';
import ProfilePage from '../screens/ProfilePage';
import {useTheme} from './ThemeContext';

const Tab = createBottomTabNavigator();

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
                    tabBarIcon: ({focused, color, size}) => (
                        <Ionicons name={focused ? 'paw' : 'paw-outline'} color={color} size={size}/>
                    ),
                }}
            />
            <Tab.Screen
                name="Map"
                component={MapPage}
                options={{
                    title: 'Map',
                    tabBarIcon: ({focused, color, size}) => (
                        <Ionicons name={focused ? 'map' : 'map-outline'} color={color} size={size}/>
                    ),
                }}
            />
            <Tab.Screen
                name="Settings"
                component={ProfilePage}
                options={{
                    title: 'Settings',
                    tabBarIcon: ({focused, color, size}) => (
                        <Ionicons name={focused ? 'settings' : 'settings-outline'} color={color} size={size}/>
                    ),
                }}
            />
        </Tab.Navigator>
    );
}