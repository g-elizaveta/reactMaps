import React, { useState, useEffect } from 'react';
import {Alert, StyleSheet, View, Text, FlatList, Image, TouchableOpacity, Modal, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMarkers } from '../../context/MarkerContext';
import { Ionicons } from '@expo/vector-icons';

export default function MarkerDetails() {
  const { id } = useLocalSearchParams();
  const markerId = typeof id === 'string' ? parseInt(id, 10) : Number(id[0]);
  const { markers, addImageToMarker, getMarkerImages, deleteImage, deleteMarker } = useMarkers();
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const marker = markers.find((m) => m.id === markerId);


  useEffect(() => {
    const loadImages = async () => {
      if (markerId) {
        const loadedImages = await getMarkerImages(markerId);
        setImages(loadedImages.map(img => img.uri));
      }
    };
    loadImages();
  }, [markerId]);

  const pickImage = async () => {
    if (!markerId) return;
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      await addImageToMarker(markerId, result.assets[0].uri);
      const updatedImages = await getMarkerImages(markerId);
      setImages(updatedImages.map(img => img.uri));
    }
  };

  const handleDeleteImage = async (uri: string) => {
    if (!markerId) return;
    
    const allImages = await getMarkerImages(markerId);
    const imageToDelete = allImages.find(img => img.uri === uri);
    
    if (imageToDelete) {
      await deleteImage(imageToDelete.id);
      setImages(prev => prev.filter(img => img !== uri));
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

  const handleDelete = async () => {
    Alert.alert(
      'Удалить маркер?',
      'Вы уверены, что хотите удалить этот маркер?',
      [
        {
          text: 'Отмена',
          style: 'cancel',
        },
        {
          text: 'Удалить',
          onPress: async () => {
            try {
              await deleteMarker(Number(id));
              router.back(); // Возвращаемся на карту
              Alert.alert('Маркер удалён');
            } catch (error) {
              Alert.alert('Ошибка', 'Не удалось удалить маркер');
            }
          },
          style: 'destructive',
        },
      ]
    );
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
              onPress={() => handleDeleteImage(item)}
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

      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={handleDelete}
      >
        <Ionicons name="trash-outline" size={24} color="red" />
        <Text style={styles.deleteButtonText}>Удалить маркер</Text>
      </TouchableOpacity>
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
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
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
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
  },
  deleteButtonText: {
    color: 'red',
    marginLeft: 10,
    fontSize: 18,
  },
});