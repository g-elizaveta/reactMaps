import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Button,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMarkers } from '../../context/MarkerContext';
import { Ionicons } from '@expo/vector-icons'; // Для иконок

export default function MarkerDetails() {
  const { id } = useLocalSearchParams();
  const { markers, updateMarker } = useMarkers();
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // Для открытия изображения в полном размере

  const marker = markers.find((m) => m.id === Number(id));

  // Синхронизируем images с данными маркера
  useEffect(() => {
    if (marker) {
      setImages(marker.images);
    }
  }, [marker]);

  // Выбор изображения из галереи
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const newImages = [...images, result.assets[0].uri];
      setImages(newImages);
      if (marker) {
        updateMarker(marker.id, newImages);
      }
    }
  };

  // Удаление изображения
  const deleteImage = (uri: string) => {
    const newImages = images.filter((image) => image !== uri);
    setImages(newImages);
    if (marker) {
      updateMarker(marker.id, newImages);
    }
  };

  // Открытие изображения в полном размере
  const openImage = (uri: string) => {
    setSelectedImage(uri);
  };

  // Закрытие модального окна
  const closeImage = () => {
    setSelectedImage(null);
  };

  if (!marker) {
    return <Text>Маркер не найден</Text>;
  }

  return (
    <View style={styles.container}>
      {/* Информация о маркере */}
      <View style={styles.markerInfo}>
        <Text style={styles.markerText}>
          Координаты: {marker.latitude.toFixed(4)}, {marker.longitude.toFixed(4)}
        </Text>
      </View>

        {/* Кнопка "Добавить изображение" */}
        <TouchableOpacity style={styles.addButton} onPress={pickImage}>
        <Text style={styles.addButtonText}>Добавить изображение</Text>
        </TouchableOpacity>
      

      {/* Список изображений */}
      <FlatList
        data={images}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <View style={styles.imageContainer}>
            <TouchableOpacity onPress={() => openImage(item)}>
              <Image source={{ uri: item }} style={styles.image} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteIcon}
              onPress={() => deleteImage(item)}
            >
              <Ionicons name="trash-outline" size={24} color="red" />
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Модальное окно для просмотра изображения в полном размере */}
      <Modal visible={!!selectedImage} transparent={true}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={closeImage}>
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>
          <Image source={{ uri: selectedImage! }} style={styles.fullImage} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  markerInfo: {
    marginBottom: 20,
  },
  markerText: {
    fontSize: 16,
    color: '#333',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 10,
  },
  addButton: {
    backgroundColor: '#007AFF', // Синий цвет, как у системной кнопки
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20, // Отступ снизу
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 15,
    padding: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  fullImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.8,
    resizeMode: 'contain',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
});