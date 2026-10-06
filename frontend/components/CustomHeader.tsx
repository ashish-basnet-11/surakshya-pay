import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ArrowLeft, MoreVertical } from 'lucide-react-native';
import { useNavigation } from 'expo-router';

export default function CustomHeader({ title = "Send Money" }) {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.circle} onPress={() => navigation.goBack()}>
        <ArrowLeft size={20} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.title}>{title}</Text>

      <TouchableOpacity style={styles.circle} onPress={() => console.log("More pressed")}>
        <MoreVertical size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      height: 90,
      paddingTop: 40,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    circle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "#132833",
      justifyContent: 'center',
      alignItems: 'center',
    },
    titleContainer: {
      position: 'absolute',
      top: 40,
      left: 0,
      right: 0,
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
    },
    title: {
      color: "#fff",
      fontSize: 18,
      fontWeight: '600',
    },
  });
  