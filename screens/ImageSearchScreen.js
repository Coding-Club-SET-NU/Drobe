import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const VISION_API_KEY = 'AIzaSyCc5bjvaNs9RAMiQxpahuyZF7298Gv5Qe0';

const ImageSearch = () => {
  const [image, setImage] = useState(null);
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(false);

  const pickImageFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Please allow media access.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const selectedImage = result.assets[0];
      setImage(selectedImage.uri);
      analyzeImage(selectedImage.base64);
    }
  };

  const takePhotoWithCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Please allow camera access.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      base64: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const selectedImage = result.assets[0];
      setImage(selectedImage.uri);
      analyzeImage(selectedImage.base64);
    }
  };

  const analyzeImage = async (base64) => {
    setLoading(true);
    try {
      const body = {
        requests: [
          {
            image: { content: base64 },
            features: [{ type: 'LABEL_DETECTION', maxResults: 5 }],
          },
        ],
      };

      const response = await axios.post(
        `https://vision.googleapis.com/v1/images:annotate?key=${VISION_API_KEY}`,
        body,
        { headers: { 'Content-Type': 'application/json' } }
      );

      const annotations = response.data.responses[0]?.labelAnnotations;

      if (!annotations || annotations.length === 0) {
        Alert.alert('No Results', 'No labels detected.');
        return;
      }

      const descriptions = annotations.map(label => label.description);
      setLabels(descriptions);

      Alert.alert('Detected Labels', descriptions.join(', '));
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Image analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImageFromGallery} style={styles.button}>
        <Text style={styles.buttonText}>🎞️Choose from Gallery</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={takePhotoWithCamera} style={styles.button}>
        <Text style={styles.buttonText}>📸 A Beautiful Photo</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="brown" style={{ marginTop: 20 }} />}

      {image && <Image source={{ uri: image }} style={styles.image} />}

      {labels.length > 0 && (
        <View style={{ marginTop: 20 }}>
          <Text style={styles.results}>Detected Keywords:</Text>
          {labels.map((label, index) => (
            <Text key={index} style={styles.keyword}>• {label}</Text>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 40,
    backgroundColor: '#fff',
    flex: 1,
  },
  button: {
    backgroundColor: '#464642ff',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  image: {
    marginTop: 20,
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  results: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 6,
  },
  keyword: {
    color: 'gray',
    fontSize: 14,
    marginLeft: 10,
    marginBottom: 2,
  },
});

export default ImageSearch;
