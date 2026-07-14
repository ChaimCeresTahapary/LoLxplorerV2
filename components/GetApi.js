const url = process.env.EXPO_PUBLIC_BASE_URL;

export async function getData() {
    const response = await fetch(url);
    const text = await response.text();

    return JSON.parse(text);
}