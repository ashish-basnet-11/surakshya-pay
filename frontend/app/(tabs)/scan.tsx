import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Image,
  Linking,
  ScrollView,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';

export default function ScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [cameraType, setCameraType] = useState<'back' | 'front'>('back');

  const sampleQRData = {
    image: require('@/assets/images/sample-qr.png'),
  };

  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  if (!permission) {
    return <View style={styles.loadingContainer} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera" size={48} color={Colors.primary} />
        <Text style={styles.permissionText}>Camera Access Required</Text>
        <Text style={styles.permissionSubtext}>
          We need your permission to scan QR codes
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    Alert.alert(
      'QR Code Scanned',
      data,
      [
        {
          text: 'OK',
          onPress: () => setScanned(false),
          style: 'default',
        },
        ...(data.startsWith('http')
          ? [
              {
                text: 'Open Link',
                onPress: () => Linking.openURL(data),
              },
            ]
          : []),
      ]
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={26} color="#fff" />
      </TouchableOpacity>

      <CameraView
        style={styles.camera}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        facing={cameraType}
      >
        <View style={styles.overlay}>
          <View style={styles.scanFrame}>
            <View style={styles.cornerTopLeft} />
            <View style={styles.cornerTopRight} />
            <View style={styles.cornerBottomLeft} />
            <View style={styles.cornerBottomRight} />
          </View>
          <Text style={styles.scanText}>Align QR code within frame</Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.flipButton}
            onPress={() => setCameraType(cameraType === 'back' ? 'front' : 'back')}
          >
            <Ionicons name="camera-reverse" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </CameraView>

      {scanned && (
        <TouchableOpacity style={styles.rescanButton} onPress={() => setScanned(false)}>
          <Ionicons name="scan" size={20} color="white" />
          <Text style={styles.rescanText}>Scan Again</Text>
        </TouchableOpacity>
      )}

      <ScrollView style={styles.sampleContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.sampleTitle}>Sample QR Code</Text>
        <Image
          source={sampleQRData.image}
          style={styles.sampleQR}
          resizeMode="contain"
        />
        <Text style={styles.sampleText}>{sampleQRData.url}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  permissionText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
    color: Colors.primary,
  },
  permissionSubtext: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
    marginBottom: 30,
  },
  permissionButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 6,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 30,
    height: 30,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: Colors.primary,
    borderRadius: 4,
  },
  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 30,
    height: 30,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: Colors.primary,
    borderRadius: 4,
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: Colors.primary,
    borderRadius: 4,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: Colors.primary,
    borderRadius: 4,
  },
  scanText: {
    marginTop: 32,
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    right: 20,
  },
  flipButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 14,
    borderRadius: 50,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  rescanButton: {
    position: 'absolute',
    bottom: 35,
    alignSelf: 'center',
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
  },
  rescanText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  sampleContainer: {
    maxHeight: 250,
    padding: 20,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginBottom: 100,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 4,
    elevation: 8,
  },
  sampleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: Colors.primary,
    textAlign: 'center',
  },
  sampleQR: {
    width: 150,
    height: 150,
    marginBottom: 15,
    alignSelf: 'center',
  },
  sampleText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
});
