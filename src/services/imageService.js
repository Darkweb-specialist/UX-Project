import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export const imageService = {
  // Launch system image library
  async pickImageFromGallery() {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permission Required',
          'Permission to access photo gallery is needed to select food donation photos.'
        );
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0].uri;
      }
      return null;
    } catch (error) {
      console.warn('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image from gallery.');
      return null;
    }
  },

  // Launch device camera
  async takePhotoWithCamera() {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permission Required',
          'Camera permission is required to capture photos of surplus food.'
        );
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0].uri;
      }
      return null;
    } catch (error) {
      console.warn('Camera capture error:', error);
      Alert.alert('Error', 'Failed to capture photo with camera.');
      return null;
    }
  },
};

export default imageService;
