import React, {useEffect, useRef, useState, useCallback} from 'react';
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import MapView, {Marker} from 'react-native-maps';
import * as Location from 'expo-location';
import {useTheme} from '../components/ThemeContext';
import {getData} from '../components/GetApi';

export default function MapPage({route, navigation}) {
    const {colors} = useTheme();

    const mapRef = useRef(null);
    const [camps, setCamps] = useState([]);
    const [selectedCampId, setSelectedCampId] = useState(
        route.params?.selectedCamp?.id ?? null
    );
    const [errorMsg, setErrorMsg] = useState(null);

    // load camp markers
    useEffect(() => {
        getData()
            .then(setCamps)
            .catch(() => setErrorMsg('Could not load camp locations.'));
    }, []);

    // ask for the user's current location once
    useEffect(() => {
        (async () => {
            const {status} = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Location permission was denied.');
            }
        })();
    }, []);

    // This is the "navigate straight to the hotspot" behaviour:
    // HomePage calls navigation.navigate('Map', { selectedCamp: item }).
    // Every time this screen comes into focus with a fresh selectedCamp param,
    // we zoom the camera there and then clear the param. Clearing it means
    // tapping the SAME hotspot again later still re-triggers the zoom, and
    // switching tabs back and forth without a new selection leaves the map
    // where the user last left it.
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
            </MapView>
            {errorMsg && (
                <View style={styles.errorBanner}>
                    <Text style={{color: '#fff'}}>{errorMsg}</Text>
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
});