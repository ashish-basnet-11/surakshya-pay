import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Image,
  Linking,
  ScrollView,
  PanResponder,
  Animated,
  Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_HEIGHT = SCREEN_HEIGHT * 0.6;
const MIN_HEIGHT = 180;

export default function ScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [cameraType, setCameraType] = useState<'back' | 'front'>('back');
  
  const panY = useRef(new Animated.Value(0)).current;
  const currentHeight = useRef(MIN_HEIGHT);
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (currentHeight.current <= MIN_HEIGHT && gestureState.dy > 0) return;
        if (currentHeight.current >= MAX_HEIGHT && gestureState.dy < 0) return;
        
        panY.setValue(gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        const gestureDistance = gestureState.dy;
        
        if (gestureDistance < -50) {
          animateTo(MAX_HEIGHT);
        } else if (gestureDistance > 50) {
          animateTo(MIN_HEIGHT);
        } else {
          animateTo(currentHeight.current);
        }
      },
    })
  ).current;

  const animateTo = (height: number) => {
    currentHeight.current = height;
    Animated.spring(panY, {
      toValue: height - MIN_HEIGHT,
      useNativeDriver: false,
    }).start();
  };

  const sampleQRData = {
    image: require('@/assets/images/sample-qr.png'),
  };

  useEffect(() => {
    (async () => {
      if (permission && !permission.granted) {
        await requestPermission();
      }
     
      const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (galleryStatus.status !== 'granted') {
        Alert.alert('Permission required', 'We need access to your gallery to scan QR codes from images');
      }
    })();
  }, [permission, requestPermission]);

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
      
        Alert.alert(
          'Image Selected',
          'QR code scanning from gallery would be implemented here',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image from gallery');
    }
  };

  if (!permission) {
    return <View style={styles.loadingContainer} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera" size={48} color="#3A7F0D" />
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

  const sampleContainerHeight = panY.interpolate({
    inputRange: [0, MAX_HEIGHT - MIN_HEIGHT],
    outputRange: [MIN_HEIGHT, MAX_HEIGHT],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setCameraType(cameraType === 'back' ? 'front' : 'back')}
          style={styles.flipButton}
        >
          <Ionicons name="camera-reverse" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          facing={cameraType}
        >
          <View style={styles.overlay}>
            <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
              <Ionicons name="qr-code" size={24} color="white" />
              <Text style={styles.galleryButtonText}>Scan from Gallery</Text>
            </TouchableOpacity>
            <View style={styles.scanFrame}>
              <View style={styles.cornerTopLeft} />
              <View style={styles.cornerTopRight} />
              <View style={styles.cornerBottomLeft} />
              <View style={styles.cornerBottomRight} />
            </View>
            <Text style={styles.scanText}>Align QR code within frame</Text>
          </View>
        </CameraView>
      </View>

      {scanned && (
        <TouchableOpacity style={styles.rescanButton} onPress={() => setScanned(false)}>
          <Ionicons name="scan" size={20} color="white" />
          <Text style={styles.rescanText}>Scan Again</Text>
        </TouchableOpacity>
      )}

      <Animated.View 
        style={[
          styles.sampleOuterContainer,
          { height: sampleContainerHeight }
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.dragHandleContainer}>
          <View style={styles.dragHandle} />
        </View>
        <View style={styles.sampleContainer}>
          <ScrollView 
            contentContainerStyle={styles.sampleContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.sampleTitle}>Scan and Pay</Text>
            <Text style={styles.sampleSubtitle}>Scan QR code to make payment</Text>
            
            <View style={styles.sampleQRContainer}>
              <Image
                source={sampleQRData.image}
                style={styles.sampleQR}
                resizeMode="contain"
              />
            </View>

            <View style={styles.buttonsContainer}>
              <TouchableOpacity style={styles.secondaryButton}>
                <Ionicons name="download" size={20} color= "#ffffff" />
                <Text style={styles.secondaryButtonText}>Download QR</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.primaryButton}>
                <Ionicons name="share" size={20} color= "#ffffff" />
                <Text style={styles.primaryButtonText}>Share QR</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Animated.View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    color: '#3A7F0D',
  },
  permissionSubtext: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
    marginBottom: 30,
  },
  permissionButton: {
    backgroundColor: '#3A7F0D',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  backButton: {
    padding: 8,
  },
  flipButton: {
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
   galleryButton: {
    position: 'absolute',
    top: '15%', 
    alignSelf: 'center', 
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
   galleryButtonText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 18,
    fontWeight: '500',
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: Colors.primary,
  },
  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: Colors.primary,
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: Colors.primary,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: Colors.primary,
  },
  scanText: {
    marginTop: 32,
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  rescanButton: {
    position: 'absolute',
    bottom: 200,
    alignSelf: 'center',
    backgroundColor: '#3A7F0D',
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  rescanText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  sampleOuterContainer: {
    backgroundColor: Colors.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    position: 'absolute',
    bottom: -60,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  dragHandleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 12,
  },
  dragHandle: {
    width: 50,
    height: 5,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
  sampleContainer: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: Colors.primary,
  },
  sampleContent: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  sampleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    color: "#ffffff",
    textAlign: 'center',
  },
  sampleSubtitle: {
    fontSize: 14,
    color: "#ffffff",
    marginBottom: 20,
    textAlign: 'center',
  },
  sampleQRContainer: {
    alignItems: 'center',
    marginVertical: 20,
    backgroundColor: "#ffffff",
    borderColor:"#2A3441",
  },
  sampleQR: {
    width: 180,
    height: 180,
    marginBottom: 12,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor:"#2A3441",
    borderRadius: 8,
    marginRight: 8,
  },
  secondaryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: "#2A3441",
    borderRadius: 8,
    marginLeft: 8,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});