import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function UserDebugInfo() {
  const { user, isAuthenticated, isLoading } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🐛 User Debug Info</Text>
      <Text style={styles.item}>Is Authenticated: {isAuthenticated ? '✅' : '❌'}</Text>
      <Text style={styles.item}>Is Loading: {isLoading ? '⏳' : '✅'}</Text>
      <Text style={styles.item}>User ID: {user?.id || 'N/A'}</Text>
      <Text style={styles.item}>User ID Type: {typeof user?.id}</Text>
      <Text style={styles.item}>User ID Length: {user?.id?.toString().length || 'N/A'}</Text>
      <Text style={styles.item}>Is UUID Format: {user?.id && user.id.toString().includes('-') ? '✅' : '❌'}</Text>
      <Text style={styles.item}>Full Name: {user?.fullName || 'N/A'}</Text>
      <Text style={styles.item}>First Name: {user?.firstName || 'N/A'}</Text>
      <Text style={styles.item}>Last Name: {user?.lastName || 'N/A'}</Text>
      <Text style={styles.item}>Email: {user?.email || 'N/A'}</Text>
      <Text style={styles.item}>User Type: {user?.userType || 'N/A'}</Text>
      <Text style={styles.item}>Avatar URL: {user?.avatarImageUrl || 'N/A'}</Text>
      <Text style={styles.small}>Raw User Object: {JSON.stringify(user, null, 2)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  item: {
    fontSize: 14,
    marginBottom: 4,
    color: '#333',
  },
  small: {
    fontSize: 10,
    color: '#666',
    marginTop: 8,
  },
}); 