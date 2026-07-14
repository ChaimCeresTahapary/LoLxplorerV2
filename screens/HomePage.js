import React, {useEffect, useState, useCallback} from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    StyleSheet,
    RefreshControl,
} from 'react-native';
import {useTheme} from '../components/ThemeContext';
import {getData} from '../components/GetApi';
import {isFavorite, toggleFavorite} from '../components/isfavorite';

export default function HomePage({navigation}) {
    const {colors, layoutMode} = useTheme();
    const [camps, setCamps] = useState([]);
    const [favorites, setFavorites] = useState({});
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const loadCamps = useCallback(async () => {
        try {
            setError(null);
            const data = await getData();
            setCamps(data);

            const favEntries = await Promise.all(
                data.map(async (camp) => [camp.id, await isFavorite(camp.id)])
            );
            setFavorites(Object.fromEntries(favEntries));
        } catch (e) {
            setError('Could not load jungle camps. Check your connection.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadCamps();
    }, [loadCamps]);

    const onRefresh = () => {
        setRefreshing(true);
        loadCamps();
    };

    const onToggleFavorite = async (campId) => {
        const newValue = await toggleFavorite(campId);
        setFavorites((prev) => ({...prev, [campId]: newValue}));
    };

    if (loading) {
        return (
            <View style={[styles.center, {backgroundColor: colors.background}]}>
                <ActivityIndicator size="large" color={colors.accent}/>
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.center, {backgroundColor: colors.background}]}>
                <Text style={{color: colors.text}}>{error}</Text>
            </View>
        );
    }

    const isGrid = layoutMode === 'grid';

    return (
        <FlatList
            key={isGrid ? 'grid' : 'list'} // force re-layout when numColumns changes
            style={{backgroundColor: colors.background}}
            contentContainerStyle={styles.listContent}
            data={camps}
            keyExtractor={(item) => item.id}
            numColumns={isGrid ? 2 : 1}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>
            }
            renderItem={({item}) => (
                <TouchableOpacity
                    style={[
                        isGrid ? styles.gridCard : styles.listCard,
                        {backgroundColor: colors.card, borderColor: colors.border},
                    ]}
                    onPress={() => navigation.navigate('Map', {selectedCamp: item})}
                >
                    <Image
                        source={{uri: item.image}}
                        style={isGrid ? styles.gridImage : styles.listImage}
                    />
                    <View style={styles.cardText}>
                        <Text style={[styles.title, {color: colors.text}]}>
                            {item.name}
                        </Text>
                        <Text style={[styles.subtitle, {color: colors.subtext}]}>
                            {item.campType}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => onToggleFavorite(item.id)}
                        style={styles.favButton}
                    >
                        <Text style={{fontSize: 20}}>
                            {favorites[item.id] ? '★' : '☆'}
                        </Text>
                    </TouchableOpacity>
                </TouchableOpacity>
            )}
        />
    );
}

const styles = StyleSheet.create({
    center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
    listContent: {padding: 12},
    listCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        padding: 10,
        marginBottom: 10,
    },
    gridCard: {
        flex: 1,
        margin: 6,
        borderRadius: 12,
        borderWidth: 1,
        padding: 10,
        alignItems: 'center',
    },
    listImage: {width: 56, height: 56, borderRadius: 8, marginRight: 12},
    gridImage: {width: 72, height: 72, borderRadius: 8, marginBottom: 8},
    cardText: {flex: 1},
    title: {fontSize: 16, fontWeight: '600'},
    subtitle: {fontSize: 13, marginTop: 2},
    favButton: {padding: 6},
});