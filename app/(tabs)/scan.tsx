import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { recognizeText } from '../../lib/ocr';
import { parseReceipt } from '../../lib/receipt-parser';

export default function ScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const isWeb = Platform.OS === 'web';

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setCapturedUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
    if (photo) {
      setCapturedUri(photo.uri);
    }
  };

  const processImage = async () => {
    if (!capturedUri) return;
    setProcessing(true);
    try {
      const ocrResult = await recognizeText(capturedUri);
      const parsed = parseReceipt(ocrResult.text);

      router.push({
        pathname: '/receipt-review',
        params: {
          imageUri: capturedUri,
          parsedData: JSON.stringify(parsed),
          rawText: ocrResult.text,
        },
      });
    } catch (error: any) {
      // Still navigate to review even if OCR fails — user can enter manually
      router.push({
        pathname: '/receipt-review',
        params: {
          imageUri: capturedUri,
          parsedData: JSON.stringify({
            merchant_name: null,
            date: null,
            total_amount: null,
            vat_amount: null,
            excl_vat_amount: null,
            vat_number: null,
            line_items: [],
          }),
          rawText: '',
        },
      });
    } finally {
      setProcessing(false);
    }
  };

  const retake = () => {
    setCapturedUri(null);
  };

  // Preview screen after capture
  if (capturedUri) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: capturedUri }} style={styles.preview} resizeMode="contain" />
        {processing ? (
          <View style={styles.processingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.processingText}>Reading receipt...</Text>
          </View>
        ) : (
          <View style={styles.previewActions}>
            <Pressable style={styles.secondaryButton} onPress={retake}>
              <Ionicons name="refresh" size={20} color="#1F4E79" />
              <Text style={styles.secondaryButtonText}>Retake</Text>
            </Pressable>
            <Pressable style={styles.primaryButton} onPress={processImage}>
              <Ionicons name="checkmark" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>Use this photo</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  }

  // Web: gallery only
  if (isWeb) {
    return (
      <View style={styles.container}>
        <View style={styles.webUpload}>
          <Ionicons name="cloud-upload-outline" size={80} color="#1F4E79" />
          <Text style={styles.title}>Upload Receipt</Text>
          <Text style={styles.description}>
            Select a photo of your receipt from your device.
          </Text>
          <Pressable style={styles.primaryButton} onPress={pickImage}>
            <Ionicons name="images" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Choose from Gallery</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Native: camera permission handling
  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.webUpload}>
          <Ionicons name="camera-outline" size={80} color="#1F4E79" />
          <Text style={styles.title}>Camera Access Required</Text>
          <Text style={styles.description}>
            We need camera access to scan your receipts.
          </Text>
          <Pressable style={styles.primaryButton} onPress={requestPermission}>
            <Text style={styles.primaryButtonText}>Grant Permission</Text>
          </Pressable>
          <Pressable style={[styles.secondaryButton, { marginTop: 12 }]} onPress={pickImage}>
            <Ionicons name="images" size={20} color="#1F4E79" />
            <Text style={styles.secondaryButtonText}>Upload from Gallery</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Native: camera view
  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back">
        <View style={styles.cameraOverlay}>
          <View style={styles.scanFrame} />
          <Text style={styles.scanHint}>Position the receipt within the frame</Text>
        </View>
        <View style={styles.cameraActions}>
          <Pressable style={styles.galleryButton} onPress={pickImage}>
            <Ionicons name="images" size={28} color="#fff" />
          </Pressable>
          <Pressable style={styles.captureButton} onPress={takePhoto}>
            <View style={styles.captureInner} />
          </Pressable>
          <View style={{ width: 56 }} />
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  cameraOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scanFrame: {
    width: 280,
    height: 400,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
    borderRadius: 12,
  },
  scanHint: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 16 },
  cameraActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#fff',
  },
  galleryButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  preview: { flex: 1, backgroundColor: '#000' },
  previewActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    backgroundColor: '#fff',
  },
  processingOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 40,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
  },
  processingText: { color: '#fff', fontSize: 16, marginTop: 12 },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1F4E79',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  secondaryButtonText: { color: '#1F4E79', fontSize: 16, fontWeight: '600' },
  webUpload: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 24,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1F4E79', marginTop: 16 },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 20,
  },
});
