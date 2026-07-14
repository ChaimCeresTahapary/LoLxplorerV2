import React, {createContext, useContext, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Two things are kept here, both count as "layout modi" for the assignment:
// 1. colorMode: 'light' | 'dark'
// 2. layoutMode: 'list' | 'grid'  -> changes how HomePage renders the hotspots

const STORAGE_KEY = 'lolxplorer-settings';

const ThemeContext = createContext(null);

export function ThemeProvider({children}) {
    const [colorMode, setColorMode] = useState('light');
    const [layoutMode, setLayoutMode] = useState('list');
    const [loaded, setLoaded] = useState(false);

    // load saved settings on app start so they survive a restart
    useEffect(() => {
        (async () => {
            try {
                const raw = await AsyncStorage.getItem(STORAGE_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (parsed.colorMode) setColorMode(parsed.colorMode);
                    if (parsed.layoutMode) setLayoutMode(parsed.layoutMode);
                }
            } catch (e) {
                console.warn('Could not load settings', e);
            } finally {
                setLoaded(true);
            }
        })();
    }, []);

    // persist whenever settings change
    useEffect(() => {
        if (!loaded) return;
        AsyncStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({colorMode, layoutMode})
        ).catch((e) => console.warn('Could not save settings', e));
    }, [colorMode, layoutMode, loaded]);

    const isDark = colorMode === 'dark';

    const theme = {
        colorMode,
        setColorMode,
        layoutMode,
        setLayoutMode,
        isDark,
        colors: {
            background: isDark ? '#101418' : '#f5f6fa',
            card: isDark ? '#1c232b' : '#ffffff',
            text: isDark ? '#f2f2f2' : '#1a1a1a',
            subtext: isDark ? '#9aa5b1' : '#666666',
            accent: '#3b82f6',
            border: isDark ? '#2a323c' : '#e2e5ea',
        },
    };

    return (
        <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
    return ctx;
}