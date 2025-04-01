import React, { useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker, LongPressEvent, Region } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { useMarkers } from '../context/MarkerContext';
import { useDatabase } from '../context/DatabaseContext';

export default function MapScreen() {
  const { isDbReady, error } = useDatabase();
  const { markers: globalMarkers, addMarker } = useMarkers();
  const router = useRouter();
  const [region, setRegion] = useState<Region>({
    latitude: 58.0105,
    longitude: 56.2502,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const handleLongPress = async (event: LongPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    
    try {
      await addMarker(latitude, longitude);
    } catch (error) {
      console.error('Error adding marker:', error);
    }
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Ошибка загрузки базы данных</Text>
        <Text style={styles.errorText}>{error.message}</Text>
      </View>
    );
  }

  if (!isDbReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Инициализация базы данных...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        onLongPress={handleLongPress}
      >
        {globalMarkers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
            onPress={() => router.push(`/marker/${marker.id}`)}
            tracksViewChanges={false}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  errorText: {
    color: 'red',
    fontSize: 18,
    marginBottom: 10,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  }
});