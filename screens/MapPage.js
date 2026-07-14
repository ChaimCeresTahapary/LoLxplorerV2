import React, {useEffect, useRef, useState, useCallback} from 'react';
import {View, Text, StyleSheet, ActivityIndicator, TouchableOpacity} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {Ionicons} from '@expo/vector-icons';
import MapView, {Marker, Polyline} from 'react-native-maps';
import * as Location from 'expo-location';
import {useTheme} from '../components/ThemeContext';
import {getData} from '../components/GetApi';

// --- small geo helpers, all done locally, no external routing API ---
const toRad = (deg) => (deg * Math.PI) / 180;
const toDeg = (rad) => (rad * 180) / Math.PI;

// bearing from point A to point B, in degrees (0 = north, 90 = east, ...)
function getBearing(lat1, lon1, lat2, lon2) {
    const y = Math.sin(toRad(lon2 - lon1)) * Math.cos(toRad(lat2));
    const x =
        Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
        Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lon2 - lon1));
    return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

// straight-line distance in meters (haversine)
function getDistanceMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(meters) {
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
}

export default function MapPage({route, navigation}) {
    const {colors} = useTheme();

    const mapRef = useRef(null);
    const [camps, setCamps] = useState([]);
    const [selectedCampId, setSelectedCampId] = useState(
        route.params?.selectedCamp?.id ?? null
    );
    const [userLocation, setUserLocation] = useState(null);
    const [heading, setHeading] = useState(0);
    const [showCompass, setShowCompass] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);

    const selectedCamp = camps.find((c) => c.id === selectedCampId) ?? null;

    // load camp markers
    useEffect(() => {
        getData()
            .then(setCamps)
            .catch(() => setErrorMsg('Could not load camp locations.'));
    }, []);

    // location + compass heading, both watched live so the arrow and
    // route line update as you move - all in-app, no Google Maps involved
    useEffect(() => {
        let positionSub;
        let headingSub;

        (async () => {
            const {status} = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Location permission was denied.');
                return;
            }

            const current = await Location.getCurrentPositionAsync({});
            setUserLocation(current.coords);

            positionSub = await Location.watchPositionAsync(
                {accuracy: Location.Accuracy.High, timeInterval: 2000, distanceInterval: 5},
                (loc) => setUserLocation(loc.coords)
            );

            headingSub = await Location.watchHeadingAsync((h) => {
                setHeading(h.trueHeading >= 0 ? h.trueHeading : h.magHeading);
            });
        })();

        return () => {
            positionSub?.remove();
            headingSub?.remove();
        };
    }, []);

    // navigating from the hotspot list zooms straight to it, no marker tap needed
    useFocusEffect(
        useCallback(() => {
            const camp = route.params?.selectedCamp;
            if (camp && mapRef.current) {
                mapRef.current.animateToRegion(
                    {
                        latitude: camp.latitude,
                        longitude: camp.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    },
                    700
                );
                setSelectedCampId(camp.id);
                navigation.setParams({selectedCamp: undefined});
            }
        }, [route.params?.selectedCamp])
    );

    const initialCamp = route.params?.selectedCamp;
    const initialRegion = initialCamp
        ? {
            latitude: initialCamp.latitude,
            longitude: initialCamp.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        }
        : {
            latitude: 52.3676,
            longitude: 4.9041,
            latitudeDelta: 0.15,
            longitudeDelta: 0.15,
        };

    // compass + distance to the currently selected camp, computed on-device
    let bearingToTarget = null;
    let distanceToTarget = null;
    if (userLocation && selectedCamp) {
        bearingToTarget = getBearing(
            userLocation.latitude,
            userLocation.longitude,
            selectedCamp.latitude,
            selectedCamp.longitude
        );
        distanceToTarget = getDistanceMeters(
            userLocation.latitude,
            userLocation.longitude,
            selectedCamp.latitude,
            selectedCamp.longitude
        );
    }
    // rotate the arrow relative to which way the phone is currently facing.
    // Ionicons' "navigate" glyph points up-and-slightly-right by default rather
    // than straight north, so ICON_OFFSET_DEG corrects for that - nudge this
    // value if the arrow looks consistently off in testing.
    const ICON_OFFSET_DEG = -45;
    const arrowRotation =
        bearingToTarget !== null
            ? (bearingToTarget - heading + ICON_OFFSET_DEG + 360) % 360
            : 0;

    if (!camps.length) {
        return (
            <View style={[styles.center, {backgroundColor: colors.background}]}>
                <ActivityIndicator size="large" color={colors.accent}/>
            </View>
        );
    }

    return (
        <View style={{flex: 1}}>
            <MapView
                ref={mapRef}
                style={StyleSheet.absoluteFillObject}
                initialRegion={initialRegion}
                showsUserLocation
                showsMyLocationButton
            >
                {camps.map((camp) => (
                    <Marker
                        key={camp.id}
                        coordinate={{latitude: camp.latitude, longitude: camp.longitude}}
                        title={camp.name}
                        description={camp.campType}
                        onPress={() => setSelectedCampId(camp.id)}
                        pinColor={selectedCampId === camp.id ? '#3b82f6' : '#e11d48'}
                    />
                ))}

                {/* the "route" - a straight line from the user to the selected camp,
            drawn directly on our own map, no external app */}
                {userLocation && selectedCamp && (
                    <Polyline
                        coordinates={[
                            {latitude: userLocation.latitude, longitude: userLocation.longitude},
                            {latitude: selectedCamp.latitude, longitude: selectedCamp.longitude},
                        ]}
                        strokeColor={colors.accent}
                        strokeWidth={4}
                        lineDashPattern={[8, 6]}
                    />
                )}
            </MapView>

            {errorMsg && (
                <View style={styles.errorBanner}>
                    <Text style={{color: '#fff'}}>{errorMsg}</Text>
                </View>
            )}

            {selectedCamp && (
                <TouchableOpacity
                    style={[styles.compassToggle, {backgroundColor: colors.card, borderColor: colors.border}]}
                    onPress={() => setShowCompass((v) => !v)}
                >
                    <Ionicons
                        name={showCompass ? 'compass' : 'compass-outline'}
                        size={18}
                        color={colors.text}
                    />
                    <Text style={{color: colors.text, fontWeight: '600', marginLeft: 6}}>
                        {showCompass ? 'Hide compass' : 'Show compass'}
                    </Text>
                </TouchableOpacity>
            )}

            {selectedCamp && showCompass && (
                <View style={[styles.compassCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
                    <Text style={[styles.compassTitle, {color: colors.text}]}>{selectedCamp.name}</Text>
                    {userLocation ? (
                        <>
                            <View style={{transform: [{rotate: `${arrowRotation}deg`}]}}>
                                <Ionicons name="navigate" size={44} color={colors.accent}/>
                            </View>
                            <Text style={[styles.distance, {color: colors.subtext}]}>
                                {formatDistance(distanceToTarget)} away
                            </Text>
                        </>
                    ) : (
                        <Text style={{color: colors.subtext}}>Waiting for location...</Text>
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
    errorBanner: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.75)',
        padding: 10,
        borderRadius: 8,
    },
    compassToggle: {
        position: 'absolute',
        top: 16,
        right: 16,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
        borderWidth: 1,
    },
    compassCard: {
        position: 'absolute',
        bottom: 24,
        alignSelf: 'center',
        borderRadius: 16,
        borderWidth: 1,
        paddingVertical: 14,
        paddingHorizontal: 22,
        alignItems: 'center',
    },
    compassTitle: {fontSize: 14, fontWeight: '600', marginBottom: 4},
    arrow: {fontSize: 42, lineHeight: 46},
    distance: {fontSize: 13, marginTop: 2},
});