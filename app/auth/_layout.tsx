import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function AuthLayout() {
    const router = useRouter();

    useEffect(() => {
        // TODO: Check if user is authenticated
        // If authenticated, redirect to tabs
        // router.replace('/(tabs)');
    }, []);

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="sign-in" />
        </Stack>
    );
} 