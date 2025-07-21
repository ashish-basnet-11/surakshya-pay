"use client"

import { useState, useEffect, useRef } from "react"
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
  StatusBar,
  Vibration,
} from "react-native"
import { CameraView, useCameraPermissions } from "expo-camera"
import * as ImagePicker from "expo-image-picker"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import Colors from "@/constants/Colors"

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window")
const MAX_HEIGHT = SCREEN_HEIGHT * 0.7
const MIN_HEIGHT = 200

export default function ScanScreen() {
  const router = useRouter()
  const [permission, requestPermission] = useCameraPermissions()
  const [scanned, setScanned] = useState(false)
  const [cameraType, setCameraType] = useState<"back" | "front">("back")
  const [flashMode, setFlashMode] = useState<"off" | "on">("off")
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<string | null>(null)

  // Animation refs
  const panY = useRef(new Animated.Value(0)).current
  const currentHeight = useRef(MIN_HEIGHT)
  const scanLineAnim = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current
  const fadeAnim = useRef(new Animated.Value(0)).current

  // Start scan line animation
  useEffect(() => {
    const scanAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    )
    scanAnimation.start()

    // Pulse animation for scan frame
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    )
    pulseAnimation.start()

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start()

    return () => {
      scanAnimation.stop()
      pulseAnimation.stop()
    }
  }, [])

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (currentHeight.current <= MIN_HEIGHT && gestureState.dy > 0) return
        if (currentHeight.current >= MAX_HEIGHT && gestureState.dy < 0) return

        panY.setValue(gestureState.dy)
      },
      onPanResponderRelease: (_, gestureState) => {
        const gestureDistance = gestureState.dy

        if (gestureDistance < -50) {
          animateTo(MAX_HEIGHT)
        } else if (gestureDistance > 50) {
          animateTo(MIN_HEIGHT)
        } else {
          animateTo(currentHeight.current)
        }
      },
    }),
  ).current

  const animateTo = (height: number) => {
    currentHeight.current = height
    Animated.spring(panY, {
      toValue: height - MIN_HEIGHT,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start()
  }

  const sampleQRData = {
    image: require("@/assets/images/sample-qr.png"),
  }

  useEffect(() => {
    ;(async () => {
      if (permission && !permission.granted) {
        await requestPermission()
      }

      const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (galleryStatus.status !== "granted") {
        Alert.alert("Permission required", "We need access to your gallery to scan QR codes from images")
      }
    })()
  }, [permission, requestPermission])

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      })

      if (!result.canceled) {
        setIsScanning(true)
        // Simulate processing
        setTimeout(() => {
          setIsScanning(false)
          Alert.alert("QR Code Found", "Payment request for $25.00 from John's Store", [
            { text: "Cancel", style: "cancel" },
            { text: "Pay Now", onPress: () => router.push("/send") },
          ])
        }, 2000)
      }
    } catch (error) {
      console.error("Error picking image:", error)
      Alert.alert("Error", "Failed to pick image from gallery")
      setIsScanning(false)
    }
  }

  if (!permission) {
    return (
      <View style={styles.loadingContainer}>
        <Animated.View style={[styles.loadingContent, { opacity: fadeAnim }]}>
          <View style={styles.loadingSpinner}>
            <Ionicons name="camera" size={48} color={Colors.primary} />
          </View>
          <Text style={styles.loadingText}>Initializing Camera...</Text>
        </Animated.View>
      </View>
    )
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <Animated.View style={[styles.permissionContent, { opacity: fadeAnim }]}>
          <View style={styles.permissionIcon}>
            <Ionicons name="camera" size={64} color={Colors.primary} />
          </View>
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionSubtext}>
            We need camera permission to scan QR codes for payments and transactions
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Ionicons name="checkmark" size={20} color="white" />
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsButton} onPress={() => Linking.openSettings()}>
            <Text style={styles.settingsButtonText}>Open Settings</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    )
  }

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return

    setScanned(true)
    setScanResult(data)
    Vibration.vibrate(100)

    // Simulate payment QR code
    if (data.includes("pay") || data.includes("amount")) {
      Alert.alert("Payment QR Code Detected", `Amount: $45.00\nMerchant: Digital Store\n\nProceed with payment?`, [
        {
          text: "Cancel",
          onPress: () => {
            setScanned(false)
            setScanResult(null)
          },
          style: "cancel",
        },
        {
          text: "Pay Now",
          onPress: () => {
            router.push("/send")
          },
        },
      ])
    } else if (data.startsWith("http")) {
      Alert.alert("Website Link Detected", data, [
        {
          text: "Cancel",
          onPress: () => {
            setScanned(false)
            setScanResult(null)
          },
          style: "cancel",
        },
        {
          text: "Open Link",
          onPress: () => Linking.openURL(data),
        },
      ])
    } else {
      Alert.alert("QR Code Scanned", data, [
        {
          text: "OK",
          onPress: () => {
            setScanned(false)
            setScanResult(null)
          },
        },
      ])
    }
  }

  const sampleContainerHeight = panY.interpolate({
    inputRange: [0, MAX_HEIGHT - MIN_HEIGHT],
    outputRange: [MIN_HEIGHT, MAX_HEIGHT],
    extrapolate: "clamp",
  })

  const scanLineTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-125, 125],
  })

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Scan QR Code</Text>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => setFlashMode(flashMode === "off" ? "on" : "off")}
            style={[styles.headerButton, flashMode === "on" && styles.activeButton]}
          >
            <Ionicons name={flashMode === "on" ? "flash" : "flash-off"} size={20} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setCameraType(cameraType === "back" ? "front" : "back")}
            style={styles.headerButton}
          >
            <Ionicons name="camera-reverse" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Camera Container */}
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          facing={cameraType}
        >
          <View style={styles.overlay}>
            {/* Gallery Button */}
            <Animated.View style={[styles.galleryButtonContainer, { opacity: fadeAnim }]}>
              <TouchableOpacity
                style={[styles.galleryButton, isScanning && styles.galleryButtonLoading]}
                onPress={pickImage}
                disabled={isScanning}
              >
                {isScanning ? (
                  <View style={styles.loadingSpinner}>
                    <Ionicons name="hourglass" size={20} color="white" />
                  </View>
                ) : (
                  <Ionicons name="images" size={20} color="white" />
                )}
                <Text style={styles.galleryButtonText}>{isScanning ? "Processing..." : "From Gallery"}</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Scan Frame */}
            <Animated.View
              style={[
                styles.scanFrame,
                {
                  transform: [{ scale: pulseAnim }],
                  opacity: fadeAnim,
                },
              ]}
            >
              {/* Animated scan line */}
              <Animated.View
                style={[
                  styles.scanLine,
                  {
                    transform: [{ translateY: scanLineTranslateY }],
                  },
                ]}
              />

              {/* Corner indicators */}
              <View style={styles.cornerTopLeft} />
              <View style={styles.cornerTopRight} />
              <View style={styles.cornerBottomLeft} />
              <View style={styles.cornerBottomRight} />

              {/* Center dot */}
              <View style={styles.centerDot} />
            </Animated.View>

            {/* Instructions */}
            <Animated.View style={[styles.instructionsContainer, { opacity: fadeAnim }]}>
              <Text style={styles.scanText}>{scanned ? "QR Code Detected!" : "Position QR code within the frame"}</Text>
              <Text style={styles.scanSubtext}>Make sure the code is clearly visible and well-lit</Text>
            </Animated.View>
          </View>
        </CameraView>
      </View>

      {/* Rescan Button */}
      {scanned && (
        <Animated.View style={[styles.rescanContainer, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={styles.rescanButton}
            onPress={() => {
              setScanned(false)
              setScanResult(null)
            }}
          >
            <Ionicons name="scan" size={20} color="white" />
            <Text style={styles.rescanText}>Scan Again</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Bottom Sheet */}
      <Animated.View style={[styles.bottomSheet, { height: sampleContainerHeight }]} {...panResponder.panHandlers}>
        {/* Drag Handle */}
        <View style={styles.dragHandleContainer}>
          <View style={styles.dragHandle} />
        </View>

        {/* Content */}
        <ScrollView style={styles.bottomSheetContent} showsVerticalScrollIndicator={false} bounces={false}>
          <View style={styles.bottomSheetHeader}>
            <Text style={styles.bottomSheetTitle}>My QR Code</Text>
            <Text style={styles.bottomSheetSubtitle}>Share this code to receive payments</Text>
          </View>

          {/* QR Code Display */}
          <View style={styles.qrCodeContainer}>
            <View style={styles.qrCodeWrapper}>
              <Image source={sampleQRData.image} style={styles.qrCodeImage} resizeMode="contain" />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionButtonIcon}>
                <Ionicons name="download" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.actionButtonText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionButtonIcon}>
                <Ionicons name="share" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.actionButtonText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionButtonIcon}>
                <Ionicons name="copy" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.actionButtonText}>Copy</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionButtonIcon}>
                <Ionicons name="print" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.actionButtonText}>Print</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <Text style={styles.quickActionsTitle}>Quick Actions</Text>

            <TouchableOpacity style={styles.quickActionItem}>
              <View style={styles.quickActionIcon}>
                <Ionicons name="card" size={24} color={Colors.primary} />
              </View>
              <View style={styles.quickActionContent}>
                <Text style={styles.quickActionTitle}>Request Payment</Text>
                <Text style={styles.quickActionSubtitle}>Create a payment request QR</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionItem}>
              <View style={styles.quickActionIcon}>
                <Ionicons name="business" size={24} color={Colors.primary} />
              </View>
              <View style={styles.quickActionContent}>
                <Text style={styles.quickActionTitle}>Merchant Code</Text>
                <Text style={styles.quickActionSubtitle}>Generate business QR code</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          <View style={styles.bottomSpacing}/>
        </ScrollView>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    alignItems: "center",
  },
  loadingSpinner: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  permissionContent: {
    alignItems: "center",
    maxWidth: 300,
  },
  permissionIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${Colors.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    textAlign: "center",
  },
  permissionSubtext: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
  },
  permissionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 16,
    minWidth: 200,
    justifyContent: "center",
  },
  permissionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  settingsButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  settingsButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "500",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 40,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  activeButton: {
    backgroundColor: Colors.primary,
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  galleryButtonContainer: {
    position: "absolute",
    top: 120,
    alignSelf: "center",
  },
  galleryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  galleryButtonLoading: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  galleryButtonText: {
    color: "white",
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "500",
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: "relative",
    borderRadius: 20,
    overflow: "hidden",
  },
  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  cornerTopLeft: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 50,
    height: 50,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: Colors.primary,
    borderTopLeftRadius: 20,
  },
  cornerTopRight: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 50,
    height: 50,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: Colors.primary,
    borderTopRightRadius: 20,
  },
  cornerBottomLeft: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 50,
    height: 50,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: Colors.primary,
    borderBottomLeftRadius: 20,
  },
  cornerBottomRight: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 50,
    height: 50,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: Colors.primary,
    borderBottomRightRadius: 20,
  },
  centerDot: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginTop: -4,
    marginLeft: -4,
  },
  instructionsContainer: {
    position: "absolute",
    bottom: 100,
    alignItems: "center",
    paddingHorizontal: 40,
  },
  scanText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  scanSubtext: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  rescanContainer: {
    position: "absolute",
    bottom: 220,
    alignSelf: "center",
  },
  rescanButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  rescanText: {
    color: "white",
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
  },
  bottomSheet: {
    position: "absolute",
    bottom: -60,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 15,
  },
  dragHandleContainer: {
    alignItems: "center",
    paddingVertical: 12,
  },
  dragHandle: {
    width: 60,
    height: 5,
    backgroundColor: "#ddd",
    borderRadius: 3,
  },
  bottomSheetContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  bottomSheetHeader: {
    alignItems: "center",
    marginBottom: 30,
  },
  bottomSheetTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  bottomSheetSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  qrCodeContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  qrCodeWrapper: {
    padding: 20,
    backgroundColor: "white",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  qrCodeImage: {
    width: 180,
    height: 180,
  },
  qrCodeInfo: {
    alignItems: "center",
  },
  qrCodeAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 4,
  },
  qrCodeMerchant: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  qrCodeDate: {
    fontSize: 14,
    color: "#666",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  actionButton: {
    alignItems: "center",
    flex: 1,
    marginHorizontal: 4,
  },
  actionButtonIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: `${Colors.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 12,
    color: "#333",
    fontWeight: "500",
  },
  quickActions: {
    marginBottom: 30,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  quickActionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    marginBottom: 12,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  quickActionSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  bottomSpacing: {
    height:70,
  }
})
