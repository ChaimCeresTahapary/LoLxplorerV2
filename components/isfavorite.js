import AsyncStorage from '@react-native-async-storage/async-storage';

// Local extra data per camp: { favorite: boolean, note: string }
// This is data that does NOT come from the JSON API - it lives only on this device.
const STORAGE_KEY = 'lolxplorer-local-data';

async function getAllLocalData() {
    try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch (e) {
        console.warn('Could not read local data', e);
        return {};
    }
}

async function saveAllLocalData(data) {
    try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.warn('Could not save local data', e);
    }
}

export async function getLocalDataForCamp(campId) {
    const all = await getAllLocalData();
    return all[campId] || {favorite: false, note: ''};
}

export async function isFavorite(campId) {
    const entry = await getLocalDataForCamp(campId);
    return entry.favorite;
}

export async function toggleFavorite(campId) {
    const all = await getAllLocalData();
    const current = all[campId] || {favorite: false, note: ''};
    const updated = {...current, favorite: !current.favorite};
    all[campId] = updated;
    await saveAllLocalData(all);
    return updated.favorite;
}

export async function saveNote(campId, note) {
    const all = await getAllLocalData();
    const current = all[campId] || {favorite: false, note: ''};
    const updated = {...current, note};
    all[campId] = updated;
    await saveAllLocalData(all);
    return updated;
}