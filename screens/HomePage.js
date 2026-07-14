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
    Modal,
    ScrollView,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
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
    const [detailCamp, setDetailCamp] = useState(null); // camp shown in the details modal

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
        <>
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
                            onPress={() => setDetailCamp(item)}
                            style={styles.iconButton}
                        >
                            <Ionicons name="information-circle-outline" size={22} color={colors.subtext}/>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => onToggleFavorite(item.id)}
                            style={styles.iconButton}
                        >
                            <Ionicons
                                name={favorites[item.id] ? 'star' : 'star-outline'}
                                size={22}
                                color={favorites[item.id] ? '#f5b301' : colors.subtext}
                            />
                        </TouchableOpacity>
                    </TouchableOpacity>
                )}
            />

            <Modal
                visible={!!detailCamp}
                animationType="slide"
                transparent
                onRequestClose={() => setDetailCamp(null)}
            >
                <View style={styles.modalBackdrop}>
                    <View style={[styles.modalCard, {backgroundColor: colors.card}]}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setDetailCamp(null)}
                        >
                            <Ionicons name="close" size={26} color={colors.text}/>
                        </TouchableOpacity>

                        {detailCamp && (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <Image
                                    source={{uri: detailCamp.image}}
                                    style={styles.detailImage}
                                />
                                <Text style={[styles.detailTitle, {color: colors.text}]}>
                                    {detailCamp.name}
                                </Text>
                                <View style={[styles.badge, {
                                    backgroundColor: colors.background,
                                    borderColor: colors.border
                                }]}>
                                    <Text style={{color: colors.subtext, fontWeight: '600'}}>
                                        {detailCamp.campType}
                                    </Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <Ionicons name="time-outline" size={18} color={colors.subtext}/>
                                    <Text style={[styles.detailRowText, {color: colors.subtext}]}>
                                        Respawns every {detailCamp.respawnMinutes} min
                                    </Text>
                                </View>

                                <Text style={[styles.description, {color: colors.text}]}>
                                    {detailCamp.description}
                                </Text>

                                <TouchableOpacity
                                    style={[styles.mapButton, {backgroundColor: colors.accent}]}
                                    onPress={() => {
                                        const camp = detailCamp;
                                        setDetailCamp(null);
                                        navigation.navigate('Map', {selectedCamp: camp});
                                    }}
                                >
                                    <Ionicons name="map-outline" size={18} color="#fff"/>
                                    <Text style={styles.mapButtonText}>View on map</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
        </>
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
    iconButton: {padding: 6},

    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalCard: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '80%',
    },
    closeButton: {alignSelf: 'flex-end', marginBottom: 8},
    detailImage: {width: '100%', height: 180, borderRadius: 12, marginBottom: 14},
    detailTitle: {fontSize: 22, fontWeight: '700', marginBottom: 8},
    badge: {
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: 4,
        paddingHorizontal: 10,
        marginBottom: 12,
    },
    detailRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 12},
    detailRowText: {marginLeft: 6, fontSize: 14},
    description: {fontSize: 15, lineHeight: 22, marginBottom: 20},
    mapButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        paddingVertical: 12,
        marginBottom: 10,
    },
    mapButtonText: {color: '#fff', fontWeight: '600', marginLeft: 8, fontSize: 15},
});