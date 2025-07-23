import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const NotificationsScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
      </View>

      {/* No Notifications */}
      <View style={styles.content}>
        <Text style={styles.noNotif}>NO NOTIFICATIONS</Text>
        <Text style={styles.subText}>
          We will notify you once we have something for you
        </Text>

        {/* Placeholders */}
        <View style={[styles.placeholder, { backgroundColor: '#d6dbaeff' }]} />
        <View style={[styles.placeholder, { backgroundColor: '#d1b59aff' }]} />
        <View style={[styles.placeholder, { backgroundColor: '#b0c5ceff' }]} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DBDBD0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 29,
    paddingBottom: 8,
    justifyContent: 'space-between',
  },
  
  content: {
    marginTop: 80,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  noNotif: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 8,
  },
  subText: {
    color: '#888',
    textAlign: 'center',
    marginBottom: 30,
  },
  placeholder: {
    width: '90%',
    height: 40,
    borderRadius: 10,
    marginVertical: 6,
    opacity: 0.6,
  },
});

export default NotificationsScreen;
