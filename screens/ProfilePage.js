import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useTheme} from '../components/ThemeContext';

export default function ProfilePage() {
    const {colors, colorMode, setColorMode, layoutMode, setLayoutMode} =
        useTheme();

    return (
        <View style={[styles.container, {backgroundColor: colors.background}]}>
            <Text style={[styles.header, {color: colors.text}]}>Settings</Text>

            <Text style={[styles.sectionLabel, {color: colors.subtext}]}>
                Color theme
            </Text>
            <View style={styles.row}>
                <OptionButton
                    label="Light"
                    active={colorMode === 'light'}
                    onPress={() => setColorMode('light')}
                    colors={colors}
                />
                <OptionButton
                    label="Dark"
                    active={colorMode === 'dark'}
                    onPress={() => setColorMode('dark')}
                    colors={colors}
                />
            </View>

            <Text style={[styles.sectionLabel, {color: colors.subtext}]}>
                Home layout
            </Text>
            <View style={styles.row}>
                <OptionButton
                    label="List"
                    active={layoutMode === 'list'}
                    onPress={() => setLayoutMode('list')}
                    colors={colors}
                />
                <OptionButton
                    label="Grid"
                    active={layoutMode === 'grid'}
                    onPress={() => setLayoutMode('grid')}
                    colors={colors}
                />
            </View>

            <Text style={[styles.hint, {color: colors.subtext}]}>
                These settings apply across the whole app and are remembered after
                you close it.
            </Text>
        </View>
    );
}

function OptionButton({label, active, onPress, colors}) {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.option,
                {
                    borderColor: active ? colors.accent : colors.border,
                    backgroundColor: active ? colors.accent : colors.card,
                },
            ]}
        >
            <Text style={{color: active ? '#fff' : colors.text, fontWeight: '600'}}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, padding: 20},
    header: {fontSize: 22, fontWeight: '700', marginBottom: 24},
    sectionLabel: {fontSize: 13, marginBottom: 8, marginTop: 12},
    row: {flexDirection: 'row', gap: 10},
    option: {
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 10,
        borderWidth: 1,
    },
    hint: {fontSize: 12, marginTop: 30, lineHeight: 18},
});