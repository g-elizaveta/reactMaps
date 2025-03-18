import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, LongPressEvent, Region } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { useMarkers } from '../context/MarkerContext';

export default function MapScreen() {
  const { markers: globalMarkers, addMarker } = useMarkers();
  const router = useRouter();
  const [region, setRegion] = useState<Region>({
    latitude: 58.0105, // Широта 
    longitude: 56.2502, // Долгота 
    latitudeDelta: 0.0922, // Масштаб
    longitudeDelta: 0.0421, // Масштаб
  });

  const handleLongPress = (event: LongPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;

    const newMarker = {
      id: Date.now(),
      latitude,
      longitude,
      images: [],
    };

    // Добавляем маркер в глобальное состояние
    addMarker(newMarker);

    // Alert.alert('Маркер добавлен', `Широта: ${latitude}, Долгота: ${longitude}`);
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region} // Управляем регионом карты
        onRegionChangeComplete={(newRegion) => setRegion(newRegion)} // Сохраняем текущий регион
        onLongPress={handleLongPress}
      >
        {globalMarkers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
            onPress={() => router.push(`/marker/${marker.id}`)}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});