import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');

    const handleForgotPassword = () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address.');
            return;
        }

        // Simulate API call for password reset
        Alert.alert('Success', 'Password reset link has been sent to your email.');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.label}>Enter your email address to reset your password:</Text>
            <TextInput
                style={styles.input}
                placeholder="Email Address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TouchableOpacity style={styles.button} onPress={handleForgotPassword}>
                <Text style={styles.buttonText}>Send Reset Link</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    label: {
        fontSize: 16,
        marginBottom: 10,
    },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#007BFF',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ForgotPassword;